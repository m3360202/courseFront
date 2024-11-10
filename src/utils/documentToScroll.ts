const documentToScroll = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default documentToScroll


export const scrollToErrorMessage = () => {
  // 使用 querySelectorAll 查找所有 p 标签
  const paragraphs = document.querySelectorAll('p');

  // 遍历所有 p 标签，检查内容是否为 "The field is required"
  for (const p of paragraphs) {
    if (p.textContent?.trim().includes("The field is required")) {
      // 平滑滚动到该 p 标签
      const topPosition = p.getBoundingClientRect().top - 200; // 计算父元素的顶部位置
      window.scrollTo({ top: topPosition, behavior: 'smooth' }); // 滚动到父元素的顶部
      
      return false
    }
  }

  return true
};

export const checkErrorMessage = () => {
  // 使用 querySelectorAll 查找所有 p 标签
  const paragraphs = document.querySelectorAll('p');

  // 遍历所有 p 标签，检查内容是否为 "The field is required"
  for (const p of paragraphs) {
    if (p.textContent?.trim().includes("The field is required")) {
      return true
    }
  }

  return false
};




