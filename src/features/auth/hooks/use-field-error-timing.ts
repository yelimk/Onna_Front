import { useState } from 'react';

/**
 * 입력칸의 빨간 문구를 언제 보여줄지 정한다. 규칙 자체(무엇이 틀렸는지)는 모르고 '언제'만 다룬다.
 * - 처음 쓰는 칸: 치는 동안에는 숨기고, 칸을 떠날 때 보여준다 (첫 글자부터 빨갛게 뜨면 방해가 된다)
 * - 빨간 문구가 떠 있는 칸을 다시 고칠 때: 맞게 고치는 순간 바로 지운다 (고쳐졌다는 걸 바로 알게)
 * - 맞던 칸을 다시 고칠 때: 치는 동안에는 숨기고, 떠날 때 다시 보여준다
 * 많은 앱이 쓰는 '사라지는 건 바로, 새로 생기는 건 떠날 때' 방식이다.
 */
export function useFieldErrorTiming<Field extends string>() {
  // 한 번이라도 떠난 칸
  const [leftFields, setLeftFields] = useState<Field[]>([]);
  const [focusedField, setFocusedField] = useState<Field>();
  // 빨간 문구가 떠 있는 채로 다시 고치기 시작한 칸. 고쳐지면 비우고, 그 뒤로는 떠날 때까지 다시 띄우지 않는다
  const [fixingField, setFixingField] = useState<Field>();

  /** 칸을 누를 때. hasError는 그 순간 칸이 틀렸는지 */
  const startEditing = (field: Field, hasError: boolean) => {
    setFocusedField(field);
    setFixingField(leftFields.includes(field) && hasError ? field : undefined);
  };

  /** 칸을 떠날 때 */
  const finishEditing = (field: Field) => {
    setFocusedField(undefined);
    setFixingField(undefined);
    setLeftFields((prev) => (prev.includes(field) ? prev : [...prev, field]));
  };

  /** 값이 바뀔 때. 고치던 칸이 맞아졌으면 그 뒤로는 떠날 때까지 빨간 문구를 띄우지 않는다 */
  const noteChange = (field: Field, hasError: boolean) => {
    if (fixingField === field && !hasError) setFixingField(undefined);
  };

  /** 지금 화면에 보여줄 빨간 문구 */
  const getVisibleError = (field: Field, error: string | undefined) => {
    if (error === undefined) return undefined;
    if (focusedField === field) return fixingField === field ? error : undefined;
    return leftFields.includes(field) ? error : undefined;
  };

  return { startEditing, finishEditing, noteChange, getVisibleError };
}
