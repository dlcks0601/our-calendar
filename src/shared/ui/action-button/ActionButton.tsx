import type { ButtonHTMLAttributes } from 'react';
import { actionButton, type ActionButtonSize, type ActionButtonVariant } from './action-button.recipe';

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** solid = 화면의 주 행동(검정 면), weak = 보조 행동, ghost = 바탕 없음 */
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  fullWidth?: boolean;
  /** 양끝을 둥글게 */
  pill?: boolean;
}

/** 글자가 있는 버튼. 아이콘만 있는 버튼은 IconButton을 쓴다. */
export default function ActionButton({
  variant,
  size,
  fullWidth,
  pill,
  className,
  type = 'button',
  ...rest
}: ActionButtonProps) {
  return <button type={type} className={actionButton({ variant, size, fullWidth, pill, className })} {...rest} />;
}
