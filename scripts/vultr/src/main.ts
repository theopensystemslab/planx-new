import { parseArgs } from 'node:util'
import { performance } from 'perf_hooks'

import VultrNode from '@vultr/vultr-node'

import {
  confirmInstanceIsReady,
  createDnsRecord,
  createInstance,
  destroyDnsRecord,
  destroyInstance,
  getAllInstances,
  getAllRecords,
  getIpAddress,
} from './api'
import logger from './logger';
import { getDurationSeconds, sleep } from './utils'
import type { VultrOsIdMapping } from './vultr'

// define constants
const VULTR_OS_ID_BY_OS: VultrOsIdMapping = {
  // get full list of options by running `vultr-cli os list`
  alpine: '2076', // only one version available
  coreOs: '391', // stable
  flatcar: '2075', // LTS
  ubuntu: '1743', // 22.04 LTS
}

// main should parse args from command line and create or destroy resources
const main = async (): Promise<number> => {

  logger.info("🚀 running vultr script")
  logger.info("🔑 initializing vultr client with API key from env")
  const vultr = VultrNode.initialize({
    // API key should be baked into environment before running script
    apiKey: process.env.VULTR_API_KEY,
  })

  // parse command line args
  const options = {
    action: {
      type: 'string',
      short: 'a',
    },
    domain: {
      type: 'string',
      short: 'd',
      default: 'planx.pizza',
    },
    pullRequestId: {
      type: 'string',
      short: 'i',
      default: '0000', // easily recognised as test pizzas
    },
    os: {
      type: 'string',
      short: 'o',
      default: 'ubuntu',
    },
  } as const

  let values;
  try {
    values = parseArgs({ options }).values
  } catch (err) {
    logger.error(`❌ error parsing command line arguments:\n${err}`)
    return 2
  }
  const action = values.action
  if (!action) {
    logger.error("❌ missing action argument (valid example: --action=create)")
    return 2
  }

  // assert values are strings (we are parsing args strictly, with defaults)
  const domain = values.domain as string
  const pullRequestId = values.pullRequestId as string
  const os = values.os as string
  logger.debug(`
  🚀 running vultr script with following arguments parsed from command line:
      action=${action}
      domain=${domain}
      pullRequestId=${pullRequestId}
      os=${os}
  `)

  // in all cases we need to check for existence of resources first
  const [ existingRecordIds, existingInstanceIds ] = await Promise.all([
    checkIfDnsRecordsExist(vultr, domain, pullRequestId),
    checkIfInstanceExists(vultr, domain, pullRequestId),
  ])

  switch (action) {
    case 'create':
      if (existingRecordIds.length > 0 || existingInstanceIds.length > 0) {
        logger.error("❌ resources already exist - not attempting to create")
        return 1
      }
      logger.info("🏗️ creating resources")
      return await create(vultr, domain, pullRequestId, VULTR_OS_ID_BY_OS[os])
    case 'destroy':
      if (existingRecordIds.length == 0 || existingInstanceIds.length == 0) {
        logger.error("❌ resources don't exist - not attempting to destroy")
        return 1
      }
      logger.info("🗑️ performing teardown")
      return await destroy(vultr, domain, existingRecordIds, existingInstanceIds)
    default:
      logger.error(`❌ invalid action: ${action} (must be 'create' or 'destroy')`)
      return 2
  }
}

const checkIfDnsRecordsExist = async (vultr: any, domain: string, id: string): Promise<string[]> => {
  logger.info(`🔍 checking for existing DNS records for pull request ${id} on domain ${domain}`);
  const allRecords = await getAllRecords(vultr, domain)
  const existingRecords = allRecords.filter(
    ({ type, name }) =>
      (type === "CNAME" && name === `*.${id}`) ||
      (type === "A" && name === id)
  )
  // we don't handle any case where only 1 of 2 records has been created (this would require a manual fix)
  if (existingRecords.length > 0) {
    logger.info(`✔ DNS records already exist`);
    logger.info(existingRecords);
    return existingRecords.map((record) => record.id)
  }
  logger.info("✘ no relevant DNS records exist");
  return []
}

const checkIfInstanceExists = async (vultr: any, domain: string, id: string): Promise<string[]> => {
  logger.info(`🔍 checking for existing instance for pull request ${id} on domain ${domain}`);
  const allInstances = await getAllInstances(vultr)
  const existingInstances = allInstances.filter((instance) => instance.label === `${id}.${domain}`);
  if (existingInstances.length > 0) {
    logger.info(`✔ instance already exists`);
    logger.info(existingInstances);
    return existingInstances.map((instance) => instance.id)
  }
  logger.info("✘ relevant instance does not exist");
  return []
}

const create = async (
  vultr: any,
  domain: string,
  id: string,
  osId: string,
): Promise<number> => {
  // keep time for logging purposes
  const t0 = performance.now()
  try {
    const instance = await createInstance(vultr, domain, id, osId)

    const instanceId = instance.id
    logger.info(`🌐 instance created with ID: ${instanceId}`)
    
    // get IP when available
    const instanceIp = await getIpAddress(vultr, instanceId);
    logger.info(`🌐 instance has been assigned IP: ${instanceIp}`);

    // create DNS records
    const [ dnsRecordA, dnsRecordCname ] = await Promise.all([
      createDnsRecord(vultr, domain, id, 'A', instanceIp),
      createDnsRecord(vultr, domain, id, 'CNAME', instanceIp),
    ])
    logger.info(`🌐 A record created with ID: ${dnsRecordA.id}`);
    logger.info(`🌐 CNAME record created with ID: ${dnsRecordCname.id}`);

    // wait for server to fully spin up
    await confirmInstanceIsReady(vultr, instanceId);
    // sometimes the server isn't immediately ready for an ssh session
    logger.info("✅ instance active - waiting another 20s to ensure it's accessible");
    await sleep(20_000);
    logger.debug(`⌛ all resources created and made ready in ${getDurationSeconds(t0, performance.now())}s`)
    
  } catch (err) {
    logger.error(`❌ error creating resources:\n${err}`)
    return 1
  }
  return 0
}

const destroy = async (
  vultr: any,
  domain: string,
  existingRecordIds: string[],
  existingInstanceIds: string[],
): Promise<number> => {
  try {
    // destroy DNS records
    await Promise.all(existingRecordIds.map((recordId) => destroyDnsRecord(vultr, domain, recordId)));
    logger.info("🔥 DNS records destroyed")
    // destroy instance
    await Promise.all(existingInstanceIds.map((instanceId) => destroyInstance(vultr, instanceId)));
    logger.info("🔥 DNS records destroyed")
  } catch (err) {
    logger.error(`❌ error destroying resources:\n${err}`)
    return 1
  }
  return 0;
}

// run main function when script is executed
main().then((exitCode) => {
  switch (exitCode) {
  case 0:
    logger.info("🎉 script completed successfully");
    break;
  case 1:
    logger.error("❌ script failed to create/destroy resources as expected");
    break;
  case 2:
    logger.error("❌ script failed due to usage error (e.g. invalid arguments)");
    break;
  }
  process.exit(exitCode)
}).catch((err) => {
  logger.error(`❌ script failed with unhandled error:\n${err}`)
  process.exit(3)
})
