let pathFor = (path, params) => {
  FlowRouter.watchPathChange();
  let query = params && params.query ? FlowRouter._qs.parse( params.query ) : {};
  return FlowRouter.path( path, params, query );
};

let urlFor = (path, params) => {
  return Meteor.absoluteUrl( pathFor(path, params) );
};

let currentRoute = (route) => {
  FlowRouter.watchPathChange();
  return FlowRouter.current().route.name === route ? 'active' : '';
};

FlowHelpers = {
  pathFor: pathFor,
  urlFor: urlFor,
  currentRoute: currentRoute
};

FlowRouter.route('/', {
  action: function() {
    ReactLayout.render(App, {
      title: "Solé",
      content: <HomeWrapper key={HomeWrapper} />
    });
  },
  name: 'home'
});

FlowRouter.route("/reply", {
   action: function(params, queryparams) {
      const URL_Prefix = "http://sole.thickmaterial.com";
      let message = [];

      links.push('<?xml version="1.0" encoding="UTF-8"?>');
      links.push("<Response>");
      links.push("  <Sms>" + URL_Prefix + program.route + "</Sms>");
      links.push("</Response>");

      return links.join("\r\n");
   }
});
