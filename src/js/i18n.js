export { internacionalizeContent };

/**
 * Traverses the tree and replaces text nodes with their internatioalized verision.
 * The text node needs to follow the pattern __MSG_{message_name}_ the message_name
 * represents the message name in the localization file.
 *
 * @param {Node} node the root of the tree which needs to be traversed.
 */
function internacionalizeContent(node) {
  if (node.innerText) {
    const matches = node.innerText.match("^__MSG_([\\w_\\d]+)__$");
    if (matches && matches.length > 1) {
      node.innerText = chrome.i18n.getMessage(matches[1]);
      return;
    }
  }
  if (node.childNodes && node.childNodes.length > 0) {
    let firstNode = node.childNodes[0];
    while (firstNode) {
      internacionalizeContent(firstNode);
      firstNode = firstNode.nextElementSibling;
    }
  }
}
