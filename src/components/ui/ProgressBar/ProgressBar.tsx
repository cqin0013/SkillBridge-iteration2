import React from "react";
import { Progress, Typography } from "antd";
import "./ProgressBar.css";

const { Text } = Typography;

export interface ProgressBarProps {
  /** Current step index (0-based) */
  current?: number;
  /** Total steps (minimum 1; Intro step=0 not counted in percentage) */
  total?: number;
  /** Optional label displayed next to the bar */
  label?: string;
}

/**
 * ProgressBar (TypeScript version)
 *
 * - Calculates percentage excluding the "Intro" (step 0).
 * - Renders AntD Progress without info text.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  current = 0,
  total = 1,
  label,
}) => {
  const steps = Math.max(1, total);
  const cur = Math.min(Math.max(0, current), steps - 1);
  const percent = steps > 1 ? Math.round((cur / (steps - 1)) * 100) : 0;

  return (
    <div className="wiz-progress" role="group" aria-label="Wizard progress">
      <div className="wiz-progress-row">
        <Progress
          percent={percent}
          showInfo={false}
          className="wiz-progress-bar"
        />
        {label && (
          <Text className="wiz-progress-label" type="secondary">
            {label}
          </Text>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;





