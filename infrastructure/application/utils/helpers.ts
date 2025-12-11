export const DEFAULT_POSTGRES_PORT = 5432
export const DEFAULT_POSTGRES_DB = 'postgres'

// PG docs: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS
// the AWS DB endpoint/URI will be of the form `instance.xxx.region.rds.amazonaws.com`
export const getPostgresDbUrl = (
  roleName: string,
  rolePassword: string,
  awsDbUri: string, 
  port: string | number = DEFAULT_POSTGRES_PORT,
  databaseName: string = DEFAULT_POSTGRES_DB,
): string => {
  // the `postgres://` prefix provides a means of locating the resource, so this is a URL, not just a URI 
  return `postgres://${roleName}:${rolePassword}@${awsDbUri}:${port}/${databaseName}`
}

export const getJavaOpts = (containerMemoryMb: number): string => {
  // max heap size for JVM should be no more than half total container memory, and a multiple of 1024M
  const halvedHeapSize = Math.floor(containerMemoryMb / 2);
  const maxHeapSizeGb = Math.floor(halvedHeapSize / 1024) || 1;
  return `-Xmx${maxHeapSizeGb}g`
}
