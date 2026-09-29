export const INSPECTOR_STYLES = `
.wmi-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  inline-size: 380px;
  max-block-size: 100vh;
  overflow-y: auto;
  padding: 16px;
  background: #101418;
  color: #e6edf3;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}

.wmi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.wmi-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.wmi-badge {
  padding-block: 2px;
  padding-inline: 8px;
  border-radius: 10px;
  font-size: 11px;
  text-transform: uppercase;
}

.wmi-badge-native {
  background: #1f6feb;
}

.wmi-badge-polyfill {
  background: #9e6a03;
}

.wmi-tools {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wmi-empty {
  margin: 0;
  color: #8b949e;
}

.wmi-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1px solid #30363d;
  border-radius: 8px;
  background: #161b22;
}

.wmi-card-name {
  margin: 0;
  font-size: 13px;
  color: #79c0ff;
}

.wmi-card-description {
  margin: 0;
  color: #8b949e;
}

.wmi-card-schema summary {
  cursor: pointer;
  color: #8b949e;
}

.wmi-card-schema pre {
  margin: 4px 0 0;
  padding: 6px;
  border-radius: 6px;
  background: #0d1117;
  overflow-x: auto;
}

.wmi-card-run {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.wmi-card-args {
  flex: 1;
  padding: 4px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: #0d1117;
  color: #e6edf3;
  font-family: inherit;
  font-size: 11px;
  resize: vertical;
}

.wmi-card-button {
  padding-block: 5px;
  padding-inline: 10px;
  border: none;
  border-radius: 6px;
  background: #238636;
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}

.wmi-card-button:disabled {
  background: #30363d;
  cursor: not-allowed;
}

.wmi-card-result {
  margin: 0;
  padding: 6px;
  border-radius: 6px;
  background: #0d1117;
  color: #7ee787;
  overflow-x: auto;
  white-space: pre-wrap;
}

.wmi-log-section {
  border-block-start: 1px solid #30363d;
  padding-block-start: 8px;
}

.wmi-log-title {
  margin: 0 0 6px;
  font-size: 12px;
  color: #8b949e;
}

.wmi-log {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-block-size: 30vh;
  overflow-y: auto;
}

.wmi-log-entry {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.wmi-log-time {
  color: #8b949e;
  white-space: nowrap;
}

.wmi-log-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.wmi-log-lifecycle .wmi-log-text {
  color: #d2a8ff;
}

.wmi-log-call .wmi-log-text {
  color: #7ee787;
}

.wmi-log-error .wmi-log-text {
  color: #ffa198;
}
`;
