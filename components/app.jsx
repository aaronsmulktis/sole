// App component - represents the whole app
App = React.createClass({

  render() {
    return (

      <div id="globalContainer" itemScope itemType="http://schema.org/EntertainmentBusiness">

        <div id="globalWrap">
          
          {this.props.content}

        </div>

      </div>
    );
  }
});
