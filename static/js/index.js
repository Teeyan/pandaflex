import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Popup from "reactjs-popup";

const customStyles = {
  content: {
      top :'50%',
      left :'50%',
  }  
};

/**
* Top Level Component
*/
class TopLevel extends React.Component {
constructor(props) {
  super(props);
  this.handleUpload = this.handleUpload.bind(this);
  this.handleFileChange = this.handleFileChange.bind(this);
  this.handleHeaderChange = this.handleHeaderChange.bind(this);
  this.state = {uploaded: false, filename: "", header: "", attrList: [], entries: new Set()};
  this.addEntry = this.addEntry.bind(this);
  this.removeEntry = this.removeEntry.bind(this);
  this.removeAttr = this.removeAttr.bind(this);
}

addEntry(attr) {
  this.setState(({entries}) => ({
    entries: new Set(entries).add(attr)
  }));
}
    
removeEntry(attr) {
  this.setState(({entries}) => {
    const newEntries = new Set(entries);
    newEntries.delete(attr);

    return {
      entries: newEntries
    };
  });
}
    
removeAttr(attr) {
  // Get rid of it first
  fetch("http://localhost:8000/drop?attr="+attr,
               {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      });
  this.setState(({attrList}) => {
    const newList = new Set(attrList);
    newList.delete(attr);
    return {attrList: Array.from(newList)}
  });
}
    
    
handleFileChange(event){
  var str = event.target.value;
  var split_array = str.split('\\');
  this.setState({filename: split_array[split_array.length-1]});
}

handleHeaderChange(event){
  var split_array = event.target.value.split("\\");
  this.setState({header: split_array[split_array.length-1]});
}

handleUpload(event) {
  event.preventDefault();
  this.setState({uploaded: true});
  fetch("http://localhost:8000/init?upload=" + this.state.filename + "&header=" + this.state.header, 
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      })
      .then(results => {
        return results.json();
      }).then(data => {
        this.setState({attrList: data})
  });
}

render() {
  console.log("RENDERING!");
  const isUploaded = this.state.uploaded;
  if(isUploaded) {
    // Get the data
    console.log(this.state.attrList);
    return(
      <div id="data">                
            <div className="split left">
                <div id="search_container">
                  <SearchList attrList={this.state.attrList} addEntry={this.addEntry} removeEntry={this.removeEntry} removeAttr={this.removeAttr}/>
                </div>
            </div>

            <div className="split right">
              <div className="centered">
                  <div id = "attributes_container">
                    <AttrList entries={this.state.entries}/> 
                  </div>
              </div>
            </div>
      </div>
    );
  } 
  else {
    console.log("no upload tyet!");
    return(
      <div id="uploadData" top="100%">
               <center>
                   <form>
                       <input id="fup" name="fileUpload" type= "file" onChange={this.handleFileChange}/> 

                       <input id="hud" name="headerUpload" type="file" onChange={this.handleHeaderChange}/>
                   </form>
                  <button type="submit" className="btn btn-primary" id="uploadbutton" onClick={this.handleUpload}>
                    Upload!
                  </button>
               </center>
      </div>   
    );
  }
}
}

/**
* Attribute Entry Component:
*   Exist in list on the right side of the screen
*/
class Entry extends React.Component {
constructor(props) {
  super(props);
  this.state = {
    mean: 0,
    mode: 0,
    median: 0,
    variance: 0,
    num_null: 0,
    openview: false,
    data: {}
  }

  this.handleNormalize = this.handleNormalize.bind(this);
  this.handleNull = this.handleNull.bind(this);
  this.viewData = this.viewData.bind(this);
  this.closeView = this.closeView.bind(this);
}

closeView() {
    this.setState({openView: false});
}
    
componentDidMount() {
  fetch('http://localhost:8000/meta?attr=' + this.props.value,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      })
  .then(results => {
    return results.json()
  }).then(data => {
    this.setState({
      mean: data.mean,
      mode: data.mode,
      median: data.median,
      variance: data.variance,
      num_null: data.num_null
    })
  })
}

/**
* Normalize this entry
*/
handleNormalize() {
  // Normalize
  fetch('http://localhost:8000/normalize?attr=' + this.props.value,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      });

  // Fetch the new metadata
  fetch('http://localhost:8000/meta?attr=' + this.props.value,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      })
  .then(results => {
    return results.json()
  }).then(data => {
    this.setState({
      mean: data.mean,
      mode: data.mode,
      median: data.median,
      variance: data.variance,
      num_null: data.num_null
    })
  })
}

/**
* Fill in Null for this entry
*/
handleNull(){
  // Fill in Null based on value
  fetch('http://localhost:8000/fill?attr=' + this.props.value + '&method=mean',
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      });

  // Fetch the new metadata
  fetch('http://localhost:8000/meta?attr=' + this.props.value,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      })
  .then(results => {
    return results.json()
  }).then(data => {
    this.setState({
      mean: data.mean,
      mode: data.mode,
      median: data.median,
      variance: data.variance,
      num_null: data.num_null
    })
  })
}

/**
* View the data points for this entry
*/ 
viewData (event){
    event.preventDefault();
  // put in a popup or some shit idk
  fetch('http://localhost:8000/view?attr=' + this.props.value,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      })
  .then(results => {
    return results.json()
  }).then(data => {
    this.setState({data: data[this.props.value]});
    this.setState({openView: true});
  });
}


render() {
  return(
    <div id="table_values">
      <h2>{this.props.value}</h2>
        <table>
            <tbody>
                <tr>
                    <th>Mean</th>
                    <th>Mode</th>
                    <th>Median</th>
                    <th>Variance</th>
                    <th>Null Number</th>
                </tr>
                <tr>
                    <td>{this.state.mean}</td>
                    <td>{this.state.mode}</td>
                    <td>{this.state.median}</td>
                    <td>{this.state.variance}</td>
                    <td>{this.state.num_null}</td>
                </tr>
            </tbody>
        </table>
      
        <button type="submit" className="btn btn-primary" id="view" onClick={this.viewData}>View</button>
        <Popup
                modal
                open={this.state.openView}
                closeOnDocumentClick
                onClose={this.closeView}
            >
                 
                <div className="header">{this.props.value}</div>
                <div className="content">
                    {this.state.data}
                </div>
            </Popup>
        <button type="submit" className="btn btn-primary" id="normalize" onClick={this.handleNormalize}>Normalize</button>
        <button type="submit" className="btn btn-primary" id="fill" onClick={this.handleNull}>Fill</button>
    </div>
  );
}
}

/**
* AttrList Component:
*  Main right side of the screen, stores the primary state for the Entry components
*/
class AttrList extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        openView: false,
        openCorr: false,
        corrData: {},
        viewData: {}
      };
      this.closeView = this.closeView.bind(this);
      this.closeCorr = this.closeCorr.bind(this);
      this.handleSave = this.handleSave.bind(this);
      this.handleCorrelate = this.handleCorrelate.bind(this);
      this.handleView = this.handleView.bind(this);
    }

    closeView() {
        this.setState({openView: false})
    }
    
    closeCorr() {
        this.setState({corrView: false})
    }
    
    // Handle Saving to a .csv file
    handleSave() {
      fetch("http://localhost:8000/save?filename=save_file.csv",
          {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      }).then(res => {
          return res.blob();
      }).then(blob => {
        var FileSaver = require('file-saver');
        FileSaver.saveAs(blob, "save_file.csv");
      });
    }

    // Handle displaying a correlation matrix of the attributes
    handleCorrelate() {
      var url = "http://localhost:8000/correlate?";
      const attrList = Array.from(this.props.entries);
      console.log(this.props.entries);
      console.log(attrList);
      for(var i = 0; i < attrList.length - 1; i++) {
        url = url + "attr=" + attrList[i] + "&";
      }
      url = url + "attr=" + attrList[attrList.length - 1] + "&method=pearson";

      fetch(url,
            {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      }).then(results => {
        return results.json();
      }).then(data =>{
        this.setState({corrData: JSON.stringify(data)});
        this.setState({openCorr: true});
      });
    }

    // Handle viewing all the attributes
    handleView() {
      if(this.props.entries.length == 0) {
          return
      } 
      var url = "http://localhost:8000/view?"
      const attrList = Array.from(this.props.entries);
      for(var i = 0; i < attrList.length - 1; i++) {
        url = url + "attr=" + attrList[i] + "&";
      }
      url = url + "attr=" + attrList[attrList.length - 1];

      fetch(url,
            {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      }).then(results => {
        return results.json();
      }).then(data => {
        this.setState({viewData: JSON.stringify(data)})
        this.setState({openView: true})
        console.log(this.state.viewData)
        console.log(data)
      });
    }


    // Render the Attribute Entries individually as controlled components
    render() {
      const attrList = Array.from(this.props.entries).map((attr) =>
        <Entry key={attr} value={attr} />
      );

      const views = this.state.viewData;
        
      return (
        <div id="attr_table">
          <ul>
            {attrList}
          </ul>
          
          <div id="summary_buttons">
            <button id="view_all_btn" className="btn btn-primary" onClick={this.handleView}> View All </button>
            <Popup
                modal
                open={this.state.openView}
                closeOnDocumentClick
                onClose={this.closeView}
            >
                 
                <div className="header"> Attribute Data </div>
                <div className="content">
                    {this.state.viewData}
                </div>
            </Popup>
            <button id="correlate_btn" className="btn btn-primary" onClick={this.handleCorrelate}> Correlate </button>
            <Popup
                modal
                open={this.state.openCorr}
                closeOnDocumentClick
                onClose={this.closeCorr}
            >
                <div className="header">Correlation Coefficients</div>
                <div className="content">
                    {this.state.corrData}
                </div>
            </Popup>
            <button id="save_btn" className="btn btn-primary" onClick={this.handleSave}> Save </button>
          </div>
          
        </div>
      );
    }
}

/**
* SearchList left side of the screen containing search entry
*/
class SearchList extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const attributeList = this.props.attrList.map((attr) =>
        <SearchEntry key={attr} value={attr} removeAttr={this.props.removeAttr} addEntry={this.props.addEntry} removeEntry={this.props.removeEntry}/>
      );
      return (
        <ul>
          {attributeList}
        </ul>
      );
    }
}

/**
* SearchEntry left side of the screen
*/
class SearchEntry extends React.Component {
constructor(props) {
  super(props);
  this.state = {
    isChecked: false
  }
  this.removeItem = this.removeItem.bind(this);
  this.checkItem = this.checkItem.bind(this);
}

checkItem() {
  if(this.state.isChecked) {
    this.props.removeEntry(this.props.value);
    this.setState({isChecked: false});
  }
  else {
    this.setState({isChecked: true});
    this.props.addEntry(this.props.value);
  }
}

removeItem() {
  if(this.state.isChecked) {
    this.props.removeEntry(this.props.value);
  }
  this.props.removeAttr(this.props.value);
}

    render() {
        return (
            <div className='FeatureSelection' id='features'>
              <input type="checkbox" onChange={this.checkItem}/>Add<br/>
                {this.props.value}
            <li id="trash_li"class="w3-xlarge"><i className="fa fa-trash" id="trash" onClick={this.removeItem}></i></li>
        </div>
        );
    }
}

// Add Code to the containers
console.log("attempting to render");
ReactDOM.render(<TopLevel />, document.getElementById("root"));
console.log("Rendered!");