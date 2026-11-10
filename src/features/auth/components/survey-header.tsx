import { AppText } from '@/components/app-text';
import { ScreenHeader } from '@/components/screen-header';
import { StepProgress } from '@/features/auth/components/step-progress';

type SurveyHeaderProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
};

/**
 * 설문 위쪽: 뒤로, 단계(1/3), 진행 막대.
 * 취향을 골라야 첫 지도를 맞춰 띄울 수 있어서 건너뛰기는 두지 않는다 (Figma GUI에서 삭제됨).
 */
export function SurveyHeader({ step, totalSteps, onBack }: SurveyHeaderProps) {
  return (
    <>
      <ScreenHeader
        center={
          <AppText variant="subtitle04" color="textTertiary">
            {`${step}/${totalSteps}`}
          </AppText>
        }
        onBack={onBack}
      />
      <StepProgress step={step} totalSteps={totalSteps} />
    </>
  );
}
