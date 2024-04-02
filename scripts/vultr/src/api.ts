import logger from './logger';
import { sleep } from "./utils";
import type { Instance, Record } from "./vultr";

const PAGINATION_DEFAULT = 100
const PULL_REQUEST_TAG = 'pullrequest'
const UNINITIALISED_IP_ADDRESS = '0.0.0.0'
const VULTR_PLAN = 'vc2-1c-1gb'
const VULTR_REGION = 'lhr'

const getRecords = async (
  vultr: any,
  domain: string,
  cursor: string | undefined = undefined,
): Promise<any> => {
  return await vultr.dns.listRecords({
    'dns-domain': domain,
    per_page: PAGINATION_DEFAULT,
    cursor: cursor,
  });
}

export const getAllRecords = async (
  vultr: any,
  domain: string,
): Promise<Record[]> => {
  let allRecords = [];
  let cursor = undefined;
  while (true) {
    const { records, meta } = await getRecords(vultr, domain, cursor);
    allRecords.push(...records);
    cursor = meta.links?.next;
    if (!cursor) break;
    logger.debug(`📜 pagination: collected ${allRecords.length} items - requesting next ${PAGINATION_DEFAULT}`)
  }
  logger.info(`👀 found ${allRecords.length} records on domain ${domain}`)
  return allRecords;
}

const getInstances = async (
  vultr: any,
  cursor: string | undefined = undefined,
): Promise<any> => {
  return await vultr.instances.listInstances({
    region: VULTR_REGION,
    // the vultr-node client wants a string for per_page here 
    per_page: String(PAGINATION_DEFAULT),
    cursor: cursor,
  });
}

export const getAllInstances = async (vultr: any): Promise<Instance[]> => {
  let allInstances = [];
  let cursor = undefined;
  while (true) {
    const { instances, meta } = await getInstances(vultr, cursor);
    allInstances.push(...instances);
    cursor = meta.links?.next;
    if (!cursor) break;
    logger.debug(`📜 pagination: collected ${allInstances.length} items - requesting next ${PAGINATION_DEFAULT}`)
  }
  logger.info(`👀 found ${allInstances.length} instances in region ${VULTR_REGION}`)
  return allInstances;
}

export const createDnsRecord = async (
  vultr: any,
  domain: string,
  id: string,
  type: string,
  instanceIp: string,
): Promise<Record> => {
  const name = type == "A" ? id : `*.${id}`;
  const data = type == "A" ? instanceIp : `${id}.${domain}`;
  const res = await vultr.dns.createRecord({
    'dns-domain': domain,
    name: name,
    type: type,
    data: data,
  })
  // vultr-node doesn't necessarily throw a proper error if record creation fails
  if (!res?.record) throw new Error(res)
  return res.record;
}

export const destroyDnsRecord = async (
  vultr: any,
  domain: string,
  id: string,
): Promise<void> => {
  return await vultr.dns.deleteRecord({
    'dns-domain': domain,
    'record-id': id,
  })
}

export const createInstance = async (
  vultr: any,
  domain: string,
  id: string,
  osId: string,
): Promise<Instance> => {
  const res = await vultr.instances.createInstance({
    region: VULTR_REGION,
    plan: VULTR_PLAN,
    tags: [PULL_REQUEST_TAG], // 'tag' is deprecated
    os_id: osId,
    hostname: `${id}.${domain}`,
    label: `${id}.${domain}`
  })
  // vultr-node doesn't necessarily throw a proper error if instance creation fails
  if (!res?.instance) throw new Error(res)
  return res.instance;
}

export const destroyInstance = async (
  vultr: any,
  instanceId: string,
): Promise<void> => {
  return await vultr.instances.deleteInstance({
    'instance-id': instanceId,
  })
}

const getInstanceIPAddress = async (
  vultr: any,
  instanceId: string
): Promise<string | undefined> => {
  try {
    const { instance } = await vultr.instances.getInstance({
      'instance-id': instanceId,
    });
    return instance?.main_ip && instance.main_ip !== UNINITIALISED_IP_ADDRESS
      ? instance.main_ip
      : undefined;
  } catch (err) {
    // do not raise in case of throttling or bad response
    logger.warn(`⚠️ error getting instance: ${err}`)
    return undefined;
  }
}

export const getIpAddress = async (
  vultr: any,
  instanceId: string,
  delayMs: number = 3_000,
  maxAttempts: number = 30,
): Promise<string> => {
  let instanceIp;
  for (let i = maxAttempts; i > 0; i--) {
    instanceIp = await getInstanceIPAddress(vultr, instanceId);
    if (instanceIp) break;
    await sleep(delayMs);
  }
  if (!instanceIp) throw new Error(
    `unable to get IP address for instance ${instanceId} ` +
    `after ${maxAttempts} attempts`
  );
  return instanceIp;
}

export const confirmInstanceIsReady = async (
  vultr: any,
  instanceId: string,
  delayMs: number = 15_000,
  maxAttempts: number = 60,
): Promise<void> => {
  let instanceIsReady = false;
  for (let i = maxAttempts; i > 0; i--) {
    try {
      const { instance } = await vultr.instances.getInstance({
        'instance-id': instanceId,
      });
      if (
        instance.power_status === "running" &&
        instance.server_status === "ok" &&
        instance.status === "active"
      ) {
        instanceIsReady = true;
        break;
      }
    } catch (err) {
      logger.warn(`⚠️ error getting instance: ${err}`)
    }
    logger.debug(`⌛ instance not ready on attempt ${maxAttempts - i + 1} - sleeping for ${delayMs/1000}s`)
    await sleep(delayMs);
  }
  if (!instanceIsReady) throw new Error(`instance ${instanceId} timeout after ${maxAttempts} attempts`);
}
