export function getStateOfDetail(detail: any) {
  if (detail) {
    const now = new Date().toISOString();
    const startTime = detail.startTime || detail.time ? new Date(detail.startTime || detail.time).toISOString() : null;
    const endTime = detail.endTime || detail.endDate ? new Date(detail.endTime || detail.endDate).toISOString() : null;
    const isStartTimeBeforeNow = startTime && startTime > now;
    const isEndTimeBeforeAfter = endTime && endTime < now;

    if (isStartTimeBeforeNow) {

      return 'Not Started';
    }
    if (detail.isGrade) {

      return 'Graded';
    }
    if (!isStartTimeBeforeNow && !detail.isSubmit && !isEndTimeBeforeAfter) {

      return 'Active';
    }
    if (!isStartTimeBeforeNow && detail.isSubmit) {

      return 'Submitted';
    }
    if (!isStartTimeBeforeNow && !detail.isSubmit && isEndTimeBeforeAfter) {

      return 'Expired';
    }

  }

  return 'Not Started'

}

export function getAnswer(detail: any) {
  if (detail && detail.answer) {
    const answer = detail.answer
    let result = answer.value.join(',');

    if (result.length > 30) {
      result = result.slice(0, 27) + '...';
    }

    return result;
  }

}
