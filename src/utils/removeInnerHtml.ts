export const removeHTMLTags = (str: string) => {
  const div = document.createElement('div');
  div.innerHTML = str;
  
  return div.textContent || div.innerText || '';
}