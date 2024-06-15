const fs = require('hexo-fs');

hexo.extend.filter.register('after_render:html', (html) => {
  // const html='</div><div class="dfghj component-wave-header"><svg class="component-2" width="960" height="75" viewBox="0 0 960 75"  xmlns="http://www.w3.org/2000/svg"><path id="wave-header" fill-rule="evenodd" clip-rule="evenodd" d="M0 75C0 75 0 15.7742 0 4.22053C480 -20.8472 430.5 75 960 49.9323C960 52.4685 960 75 960 75H0Z" /></svg>'

  // Extract component classes from the page HTML code
  var re=/[ "](component[-a-z0-9]+)[ "]/g;
  var matches = html.matchAll(re);
  var componentClasses = [];
  for (const match of matches) {
    if (!componentClasses.includes(match[1])) componentClasses.push(match[1]);
  }

  console.log("Found CSS components:")
  console.log(componentClasses);

  // Find corresponding css file on filesystem
  var css="";
  var cssDev = "";
  for(componentClass of componentClasses){
    var path = "./themes/blueberry/source/css/components/" + componentClass + ".css";
    if (fs.existsSync(path)) css += fs.readFileSync(path);

    var pathDev = "./themes/blueberry/source/css/components/" + componentClass + "-dev.css";
    if (fs.existsSync(pathDev)) cssDev += fs.readFileSync(pathDev);
  }

  // Inject CSS into the HTML
  html = html.replace('.hexo-filter-components-css-here{}', css);
  html = html.replace('.hexo-filter-components-css-dev-here{}', cssDev);

  return html;
});