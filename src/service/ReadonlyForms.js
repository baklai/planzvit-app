export const AutocompleteOffForms = () => {
  const form = document.querySelector('[autocomplete="off"]');
  if (!form) return;
  const getAllFormElements = element =>
    Array.from(element.elements).filter(tag =>
      ['select', 'textarea', 'input'].includes(tag.tagName.toLowerCase())
    );
  const elements = getAllFormElements(form);
  elements.forEach(element => {
    element.setAttribute('readonly', 'readonly');
  });
  setTimeout(() => {
    elements.forEach(element => {
      element.removeAttribute('readonly');
    });
  }, 500);
};
