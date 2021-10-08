
// This is a dom element access adapter for JSSoup
export default class JSSoupAdapter {

  descendants(domElement) {
    return domElement.descendants.filter(this.isTagElement)
  }
  
  children(domElement) {
    return domElement.contents.filter(this.isTagElement)
  }
  
  nextSibling(domElement) {
    var nextSiblings = this.nextSiblings(domElement);
    if (nextSiblings.length > 0) return nextSiblings[0];
    return null;
  }

  nextSiblings(domElement) {
    return domElement.nextSiblings.filter(this.isTagElement);
  }

  elementName(domElement) {
    return domElement.name;
  }

  attributes(domElement) {
    return domElement.attrs
  }
  
  name(domElement) {
    return domElement.name
  }
  
  isTagElement(domElement) {
    return domElement.constructor.name == "SoupTag"
  }
}
