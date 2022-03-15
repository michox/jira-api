//post: /rest/servicedesk/1/servicedesk/agent/REC/sla/metrics
//put: /rest/servicedesk/1/servicedesk/agent/REC/sla/metrics/id

interface SLACreateRequest {
  name: string;
  config: SLAConfig;
}

interface SLAConfig {
  definition: Definition;
  goals: Goal[];
}

interface Goal {
  jqlQuery: string;
  defaultGoal: boolean;
}

interface Definition {
  start: Condition[];
  pause: Condition[];
  stop: Condition[];
  inconsistent: boolean;
}

interface Condition {
  pluginKey: string;
  factoryKey: string;
  conditionId: string;
  name: string;
}

/**{
  "id": 6,
  "name": "Some Metric Name",
  "config": {
    "definition": {
      "start": [
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-set-hit-condition",
          "type": "Start",
          "name": "Assignee: From Unassigned",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-cleared-hit-condition",
          "name": "Assignee: To Unassigned"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-changed-hit-condition",
          "name": "Assignee: Changed"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "comment-sla-condition-factory",
          "conditionId": "comment-by-reporter-hit-condition",
          "name": "Comment: By Customer"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "issue-created-sla-condition-factory",
          "conditionId": "issue-created-hit-condition",
          "name": "Issue Created"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "comment-sla-condition-factory",
          "conditionId": "comment-for-reporter-hit-condition",
          "name": "Comment: For Customers"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "resolution-sla-condition-factory",
          "conditionId": "resolution-set-hit-condition",
          "name": "Resolution: Set"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "resolution-sla-condition-factory",
          "conditionId": "resolution-cleared-hit-condition",
          "name": "Resolution: Cleared"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10000",
          "name": "Entered Status: Interviewing"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10002",
          "name": "Entered Status: Screening"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10005",
          "name": "Entered Status: Rejected"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10004",
          "name": "Entered Status: Accepted"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10006", //id of the workflow
          "name": "Entered Status: Applications"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10003",
          "name": "Entered Status: Offer Discussions"
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10001",
          "name": "Entered Status: Interview Debrief"
        }
      ],
      "pause": [
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-not-set-match-condition",
          "type": "Pause",
          "name": "Assignee: Not Set",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-set-match-condition",
          "type": "Pause",
          "name": "Assignee: Set",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "resolution-sla-condition-factory",
          "conditionId": "resolution-not-set-match-condition",
          "type": "Pause",
          "name": "Resolution: Not Set",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "resolution-sla-condition-factory",
          "conditionId": "resolution-set-match-condition",
          "type": "Pause",
          "name": "Resolution: Set",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10004",
          "type": "Pause",
          "name": "Status: Accepted",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10006",
          "type": "Pause",
          "name": "Status: Applications",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10001",
          "type": "Pause",
          "name": "Status: Interview Debrief",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10000",
          "type": "Pause",
          "name": "Status: Interviewing",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10003",
          "type": "Pause",
          "name": "Status: Offer Discussions",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10005",
          "type": "Pause",
          "name": "Status: Rejected",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10002",
          "type": "Pause",
          "name": "Status: Screening",
          "missing": false
        }
      ],
      "stop": [
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-changed-hit-condition",
          "type": "Stop",
          "name": "Assignee: Changed",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-set-hit-condition",
          "type": "Stop",
          "name": "Assignee: From Unassigned",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "assignee-sla-condition-factory",
          "conditionId": "assignee-cleared-hit-condition",
          "type": "Stop",
          "name": "Assignee: To Unassigned",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "comment-sla-condition-factory",
          "conditionId": "comment-by-reporter-hit-condition",
          "type": "Stop",
          "name": "Comment: By Customer",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "comment-sla-condition-factory",
          "conditionId": "comment-for-reporter-hit-condition",
          "type": "Stop",
          "name": "Comment: For Customers",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10004",
          "type": "Stop",
          "name": "Entered Status: Accepted",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10006",
          "type": "Stop",
          "name": "Entered Status: Applications",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10001",
          "type": "Stop",
          "name": "Entered Status: Interview Debrief",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10000",
          "type": "Stop",
          "name": "Entered Status: Interviewing",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10003",
          "type": "Stop",
          "name": "Entered Status: Offer Discussions",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10005",
          "type": "Stop",
          "name": "Entered Status: Rejected",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "status-sla-condition-factory",
          "conditionId": "10002",
          "type": "Stop",
          "name": "Entered Status: Screening",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "issue-created-sla-condition-factory",
          "conditionId": "issue-created-hit-condition",
          "type": "Stop",
          "name": "Issue Created",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "resolution-sla-condition-factory",
          "conditionId": "resolution-cleared-hit-condition",
          "type": "Stop",
          "name": "Resolution: Cleared",
          "missing": false
        },
        {
          "pluginKey": "com.atlassian.servicedesk",
          "factoryKey": "resolution-sla-condition-factory",
          "conditionId": "resolution-set-hit-condition",
          "type": "Stop",
          "name": "Resolution: Set",
          "missing": false
        }
      ],
      "inconsistent": false
    },
    "goals": [
      {
        "id": "11",
        "jqlQuery": "project = REC",
        "defaultGoal": false,
        "calendarName": "24/7 Calendar (Default)",
        "timeMetricId": 0,
        "duration": 20400000
      },
      { "id": "12", "defaultGoal": true, "timeMetricId": 0, "calendarId": 2 }
    ]
  }
}
 */