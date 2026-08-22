/**
 * HTML disabled는 DevTools로 제거할 수 있으므로,
 * 클릭 핸들러에서도 같은 조건을 다시 검사한다.
 */
export const resolveDetailNavigationId = <TId extends string | number>(
  targetId: TId | null,
  disabled: boolean
): TId | null => {
  if (disabled || targetId == null) {
    return null;
  }

  return targetId;
};

/**
 * 현재 상세 응답의 prevId/nextId가 아니면 이동하지 않는다.
 * 조회 전이거나 응답 id가 없으면 이동을 막는다.
 */
export const isDetailNeighborId = <TId extends string | number>(
  id: TId,
  neighbors: { prevId: TId | null; nextId: TId | null } | null
) => neighbors != null && (id === neighbors.prevId || id === neighbors.nextId);
