Home = React.createClass({

  // LIFECYCLE
  componentDidMount() {
  },

  render() {
    return (
      <div>
        <div className="container-fluid jumbotron noPadding">
          <p className="text-center">Hey</p>
        </div>
        <div className="container-fluid">
          <h1 className="text-center">Yeah</h1>
          <div className="row">
            <div className="col-sm-8 col-sm-offset-2">
              <p></p>
              <a href="" className="btn btn-primary">what</a>
            </div>
          </div>
          <hr></hr>
        </div>
      </div>
    );
  }
});

HomeWrapper = React.createClass({

  // mixins: [ReactMeteorData],
  //
  // getMeteorData() {
  //   // debugger;
  //   let data = { pageContent: [] },
  //       handles = [Meteor.subscribe("pages")];
  //   if (!handles.every(utils.isReady)) {
  //       data.loading = true;
  //       return data;
  //   } else {
  //       let pageContent = Pages.findOne({
  //         page: "about"
  //       });
  //
  //       data.pageContent = pageContent;
  //   }
  //   return data;
  //
  // },

  render() {

    // if (this.data.loading) {
    //     return (
    //       <div className="loader-container">
    //           <div className="loader">
    //               <p><i className="fa fa-camera-retro fa-spin fa-2x"></i></p>
    //               <p>Loading...</p>
    //           </div>
    //       </div>
    //     )
    // }

    return (
      <Home
        key={Home}
      />
    );
  }
});
