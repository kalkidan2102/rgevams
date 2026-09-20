export interface IAlertConfig {
  minMagnitude: number;
  maxDepth: number;
  depthThreshold: number;
  emailAlertsEnabled: boolean;
  smsAlertsEnabled: boolean;
  alertRecipientsEmail: string[];
  alertRecipientsPhone: string[];
  targetRegions: string[];
  autoDispatchOnCritical: boolean;
  severityFilter: string;
  smsTemplateText: string;
  emailSubjectTemplate: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IAlertDispatch {
  id: string;
  eventId?: string;
  type: "sms" | "email" | "both";
  eventTitle: string;
  magnitude: number;
  depth: number;
  location: string;
  severity: string;
  recipientsCount: number;
  recipients: string[];
  status: string;
  timestamp: string;
  details: string;
}

export const defaultAlertConfig: IAlertConfig = {
  minMagnitude: 4.5,
  maxDepth: 35,
  depthThreshold: 35,
  emailAlertsEnabled: true,
  smsAlertsEnabled: true,
  alertRecipientsEmail: [
    "directorate.alert@essgi.gov.et",
    "duty.seismologist@essgi.gov.et",
    "drmc.operations@drmc.gov.et"
  ],
  alertRecipientsPhone: [
    "+251911223344",
    "+251922334455",
    "+251933445566"
  ],
  targetRegions: [
    "Afar Depression & Danakil Graben",
    "Main Ethiopian Rift (MER) Corridor",
    "Fentale-Awash Basin",
    "Central Highlands Escarpment"
  ],
  autoDispatchOnCritical: true,
  severityFilter: "Orange",
  smsTemplateText: "ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}. Automatic advisory triggered by ESSGI early warning system.",
  emailSubjectTemplate: "[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}",
  updatedAt: new Date().toISOString(),
  updatedBy: "ESSGI Directorate Master"
};

export const defaultAlertDispatches: IAlertDispatch[] = [
  {
    id: "disp_init_1",
    type: "both",
    eventTitle: "M 4.9 Awash Basin & Fentale Graben Seismic Tremor",
    magnitude: 4.9,
    depth: 10,
    location: "Awash Basin & Fentale Graben, Main Ethiopian Rift",
    severity: "Orange",
    recipientsCount: 6,
    recipients: [
      "directorate.alert@essgi.gov.et",
      "duty.seismologist@essgi.gov.et",
      "drmc.operations@drmc.gov.et",
      "+251911223344",
      "+251922334455",
      "+251933445566"
    ],
    status: "dispatched",
    timestamp: "2024-08-25T19:43:00.000Z",
    details: "Automated trigger: Magnitude 4.9 >= threshold 4.5 and Depth 10km <= threshold 35km. Broadcasted via Ethio Telecom SMS gateway and SMTP."
  },
  {
    id: "disp_init_2",
    type: "sms",
    eventTitle: "M 4.5 Semera Graben Crustal Rifting Swarm",
    magnitude: 4.5,
    depth: 8,
    location: "Semera Graben, Afar Triple Junction",
    severity: "Orange",
    recipientsCount: 3,
    recipients: ["+251911223344", "+251922334455", "+251933445566"],
    status: "dispatched",
    timestamp: "2024-08-14T08:19:15.000Z",
    details: "Automated SMS alert pushed to Afar regional disaster duty officers."
  }
];

