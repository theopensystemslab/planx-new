export interface Instance {
  id: string;
  os: string;
  ram: number;
  disk: number;
  main_ip: string;
  vcpu_count: number;
  region: string;
  plan: string;
  date_created: string;
  status: string;
  allowed_bandwidth: number;
  netmask_v4: string;
  gateway_v4: string;
  power_status: string;
  server_status: string;
  v6_network: string;
  v6_main_ip: string;
  v6_network_size: number;
  label: string;
  internal_ip: string;
  kvm: string;
  tag: string;
  tags: string[],
  os_id: number;
  app_id: number;
  image_id: string;
  firewall_group_id: string;
  features: any[];
  default_password: string;
}

export interface Record {
  id: string;
  type: string;
  name: string;
  data: string;
  priority: number;
  ttl: number;
}

export interface VultrOsIdMapping {
    [key: string]: string
  }
