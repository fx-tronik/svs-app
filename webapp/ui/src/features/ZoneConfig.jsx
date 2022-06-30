import React, { Component } from 'react';
import './ZoneConfig.css';
import {Button,Select,Input,Table,Row,Col,Popconfirm,message} from 'antd';
import $ from 'jquery';
import JSMpeg from 'jsmpeg-player';

const Option = Select.Option;

class ZoneConfig extends Component {

  constructor(props) {
    super(props);
    this.state = {
       //component state
       btnStartDrawText: "AddZone",
       btnStartDrawIcon: "edit",
       selectCamValue: "",
       selectCamValues: [],
       allowCamSelect: false,
       selectZoneValue: "",
       selectZoneValues: [],
       divZonesVisible: false,
       divZonePropVisible: false,
       divUpperMenuVisible: false,
       btnCancelDrawVisible: false,
       camStatus: "nodata", //nodata, disconnectd, connecting, connected, captured
       inputTxtNameText: "",
    }
  }

  zoneDrawingNew = true;
  zoneDrawingActive = "";
  drawnPolygon = [];
  zones = [];
  camPlayer = "";
  camIsConnectingSec = "";
  camLastStreamSec = 0;
  camFrameWidth = "";
  camFrameHeight = "";
  cameraList = "";
  cameraListSelectedIndex = -1;
  socket = "";
  streamWatchdog = "";
  APIurl = "http://localhost:8000";
  WSclient = "ws://localhost:";

  toggleDivZonesVisible(show) {
    this.setState({divZonesVisible: show});
  }
  toggleDivZonePropVisible(show) {
    this.setState({divZonePropVisible: show});
  }
  toggleDivUpperMenuVisible(show) {
    this.setState({divUpperMenuVisible: show});
  }
  toggleBtnCancelDrawVisible(show) {
    this.setState({btnCancelDrawVisible: show});
  }
  toggleDivCanvasCamVisible(show) {
    if (show) $("#divCanvasCam").show(); else $("#divCanvasCam").hide();
  }
  toggleDivCanvasVisible(show) {
    if (show) $("#divCanvas").show(); else $("#divCanvas").hide();
  }

  inputTxtNameHandleChange(event) {
    this.setState({inputTxtNameText: event.target.value})
  }

  render() {
    const {selectCamValue, selectCamValues, allowCamSelect, selectZoneValue, selectZoneValues, camStatus, btnStartDrawText, btnStartDrawIcon,
      divUpperMenuVisible, divZonesVisible, divZonePropVisible, btnCancelDrawVisible, inputTxtNameText} = this.state;
    //disable/enable select lists
    var selectCamDisabled = false;
    if (selectCamValue === "" || !allowCamSelect) selectCamDisabled = true;
    var selectZoneDisabled = false;
    if (selectZoneValue === "" || this.zoneDrawingActive === 1) selectZoneDisabled = true;

    //disable/enable camera menu buttons
    var btnCamConnectDisabled = true;
    var btnCamDisconnectDisabled = true;
    var btnCamCaptureDisabled = true;
    var btnCamFinishDisabled = true;
    var btnCamConnectLoadingIcon = false;
    var btnCamConnectText = "Connect";
    switch(camStatus) {
      case "nodata":
        selectCamDisabled = true;
        break;
      case "disconnected":
        btnCamConnectDisabled = false;
        break;
      case "connecting":
        selectCamDisabled = true;
        btnCamConnectDisabled = false;
        btnCamConnectLoadingIcon = true;
        btnCamConnectText = "Connecting";
        break;
      case "connected":
        selectCamDisabled = true;
        btnCamDisconnectDisabled = false;
        btnCamCaptureDisabled = false;
        break;
      case "captured":
        selectCamDisabled = true;
        btnCamFinishDisabled = false;
        break;
      default:
        break;
      }

    //activation of points editing
    var btnDrawNewPointsDisable = this.zoneDrawingActive;
    if (this.zones.length===0) btnDrawNewPointsDisable = true;

    //Selected Zone points to show
    var tableZonePointsDataSource=[];
    if (this.zones.length>0)  {
      var scaledzones = xah_deep_copy_array_or_object(this.zones);
      this.scaleZones(scaledzones,{"Width":scaledzones[this.selectedZoneIndex()].Properties.ImageWidth, "Height":scaledzones[this.selectedZoneIndex()].Properties.ImageHeight},{"Width":this.camFrameWidth, "Height":this.camFrameHeight});
      for (var i =0; i < scaledzones[this.selectedZoneIndex()].ZonePoints.length; i++) {
        var data = {
          nr: i+1,
          x: scaledzones[this.selectedZoneIndex()].ZonePoints[i].x,
          y: scaledzones[this.selectedZoneIndex()].ZonePoints[i].y
        };
        tableZonePointsDataSource.push(data);
      }
    }
    var tableZonePointsColumns = [{
      title: 'Nr',
      dataIndex: 'nr',
      key: 'nr',
    }, {
      title: 'X',
      dataIndex: 'x',
      key: 'x',
    }, {
      title: 'Y',
      dataIndex: 'y',
      key: 'y',
    }];

    var popconfirmTtext = 'Are you sure?';

    let upperMenu =
    <div id="divUpperMenu">
      <Row type="flex" justify="space-around">
        <Col span={3} ><center>
          <Select id="selectCam" style={{width: "100%"}} onChange={this.selectedCamChanged.bind(this)} value={selectCamValue} disabled={selectCamDisabled} showArrow={allowCamSelect}>
            {selectCamValues.map(v => (<Option key={v} value={v}>{v}</Option>))}</Select>
        </center></Col>
        <Col span={11} ><center>
          <Button.Group>
            <Button id="btnCamConnect" type="primary" onClick={this.connectToCam.bind(this)} icon ="retweet" loading={btnCamConnectLoadingIcon} disabled={btnCamConnectDisabled} style={{width: "123px"}}>
              {btnCamConnectText}</Button>
            <Button id="btnCamDisconnect" type="danger" onClick={this.disconnectFromCam.bind(this)} icon ="disconnect" disabled={btnCamDisconnectDisabled}>Disconnect</Button>
            <Button id="btnCamCapture" type="primary" onClick={this.captureCamFrame.bind(this)} icon ="video-camera" disabled={btnCamCaptureDisabled}>Capture</Button>
            <Button id="btnCamFinish" type="danger" onClick={this.finishCam.bind(this)} icon ="check" disabled={btnCamFinishDisabled}>Finish</Button>
          </Button.Group>
        </center></Col>
        <Col span={4}><center>
        {divUpperMenuVisible ? (
          <Button.Group>
            <Button id="btnClear" onClick={this.clearCanvas.bind(this)} type="default">Clear</Button>
            <Button id="btnShow" onClick={this.drawAll.bind(this)} type="default">Show</Button>
          </Button.Group>
        ) : null }
        </center></Col>
        <Col span={6} style={{textAlign:"right"}}>
        {divUpperMenuVisible ? (
          <Button.Group>
            <Popconfirm placement="bottom" title={popconfirmTtext} onConfirm={this.loadConfig.bind(this)} okText="Yes" cancelText="No">
              <Button id="btnLoad" type="primary" icon ="download">Load Config</Button>
            </Popconfirm>
            <Popconfirm placement="bottom" title={popconfirmTtext} onConfirm={this.saveConfig.bind(this)} okText="Yes" cancelText="No">
              <Button id="btnSave" type="primary" icon ="save">Save Config</Button>
            </Popconfirm>
          </Button.Group>
        ) : null }
        </Col>
      </Row>
    </div>

    let canvasArea =
    <div id="divCanvas" className="divCanvas">
      <canvas id="canvasImg" width="1024" height="100"></canvas>
      <canvas id="canvasZones" width="1024" height="100"></canvas>
      <canvas id="canvasDraw" width="1024" height="100" onMouseUp={this.canvasMouseUp.bind(this)}></canvas>
    </div>

    let canvasCamArea =
    <div id="divCanvasCam" className="divCanvas">
      <canvas id="canvasCam" width="1024" height="100"></canvas>
    </div>

    let zonesMenu =
    <div id="divZones" style={{textAlign:"left"}}>
        <Button id="btnStartDraw" onClick={this.toggleDraw.bind(this)} type="primary"
          icon ={btnStartDrawIcon}>{btnStartDrawText} </Button>
        {btnCancelDrawVisible ? (
          <Button id="btnCancelDraw" onClick={this.stopDraw.bind(this,0)} type="danger"  icon ="close">Cancel</Button>
        ) : null }
      <div id="divZoneList">
        Select Zone
        <Select id="selectZone" style={{width: "100%"}} onChange={this.selectedZoneChanged.bind(this)} value={selectZoneValue} disabled={selectZoneDisabled}>
          {selectZoneValues.map(v => (<Option key={v} value={v}>{v}</Option>))}</Select><br/>

        <Button id="btnDrawNewPoints" onClick={this.drawNewPoints.bind(this)} icon ="edit" disabled={btnDrawNewPointsDisable} block>Set New Points</Button><br/>

        <Popconfirm placement="left" title={popconfirmTtext} onConfirm={this.makeFullscreen.bind(this)} okText="Yes" cancelText="No">
          <Button id="btnMakeFullscreen" icon ="fullscreen" disabled={selectZoneDisabled} block>Set Frame Points</Button><br/>
        </Popconfirm>

        <Popconfirm placement="left" title={popconfirmTtext} onConfirm={this.deleteZone.bind(this)} okText="Yes" cancelText="No">
          <Button id="btnDeleteSelected" type="danger" icon ="delete" disabled={selectZoneDisabled} block>Delete Current Zone</Button><br/>
        </Popconfirm>

        <Popconfirm placement="left" title={popconfirmTtext} onConfirm={this.deleteAllZones.bind(this)} okText="Yes" cancelText="No">
          <Button id="btnDeleteAll" type="danger" icon ="delete" disabled={selectZoneDisabled} block>Delete All Zones</Button>
        </Popconfirm>

        {divZonePropVisible ? (
          <div id="divZoneProp" >
            Zone Properties<br/>
            <Input id="inputTxtName" type="text" addonBefore ="Name" value={inputTxtNameText} onChange={this.inputTxtNameHandleChange.bind(this)} style={{width: "100%"}} disabled={selectZoneDisabled}/>
            <Button id="btnUpdate" block onClick={this.updateProperties.bind(this)} type="primary" disabled={selectZoneDisabled}>Update</Button><br/><br/>
            <Table id="tableZonePoints" title={() => 'Zone Points'} pagination={{ pageSize: 6 }} size="small" rowKey="nr" dataSource={tableZonePointsDataSource} columns={tableZonePointsColumns} />
          </div>
        ) : null }
      </div>
    </div>

    return (
    <div className="App">
      <center>
      <div id="divMain">
        {upperMenu}
        <Row type="flex" justify="space-around" gutter={8} style={{ marginTop: 8 }}>
          <Col span={20} ><center>
            {canvasArea}
            {canvasCamArea}
          </center></Col>
          <Col span={4} ><center>
            {divZonesVisible ? (
              zonesMenu
            ) : null }
          </center></Col>
        </Row>
      </div>
      </center>
    </div>
    );
  }
  componentWillUnmount() {
      this.finishCam()
      this.disconnectFromCam()
  }
  componentDidMount() {
      this.toggleDivZonesVisible(false);
      this.toggleDivZonePropVisible(false);
      this.toggleDivCanvasVisible(false);
      this.toggleDivCanvasCamVisible(false);
      this.toggleDivUpperMenuVisible(false);
      this.toggleBtnCancelDrawVisible(false);
      this.zoneDrawingActive = 0;
      this.camIsConnectingSec=0;
      this.loadCamerasData();
  };

  //canvasDraw  - shows currently drawn polygon
  //canvasZones - shows all zones polygon
  //canvasImg   - shows captured frame
  //canvasCam   - shows stream from selected camera
  canvasMouseUp(evt) {
    var canvas_draw = $('#canvasDraw')[0];
    var mousePos = this.getMousePos(canvas_draw, evt);
    //drawing polygon
    if (mousePos.which === 1) { //left click
      if (this.zoneDrawingActive) {
        this.drawnPolygon.push({"x":mousePos.x, "y":mousePos.y}); //add clicked X,Y to polygon
        this.drawPoly(this.drawnPolygon,false,false); //draw current polygon on canvas
      }
    }
    else if (mousePos.which === 3) { //right click
      this.stopDraw(1); //apply drawn polygon
      var ctx_draw = canvas_draw.getContext('2d');
      if (this.zones.length>0) this.zones[this.selectedZoneIndex()].IsEdited = false;
      ctx_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
      this.setState({ btnStartDrawText: "Add Zone", btnStartDrawIcon: "edit" });
    }
    //check if click is inside any of polygons (if not drawing new one)
    if(!this.zoneDrawingActive) {
      var tempcanvas = document.createElement("CANVAS");
      tempcanvas.height = canvas_draw.height;
      tempcanvas.width = canvas_draw.width;
      var tempctx = tempcanvas.getContext('2d');
      if (this.zones.length) {
        for (var i =0; i < this.zones.length; i++) { //iterate through existing zones
          var points = this.zones[i].ZonePoints; //get zone polygon
          tempctx.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
          //draw red-filled polygon on temporary canvas
          tempctx.fillStyle = "red";
          tempctx.beginPath();
          tempctx.moveTo(points[0].x, points[0].y);
          for( var item=1 ; item < points.length ; item++ ){tempctx.lineTo( points[item].x , points[item].y )}
          tempctx.closePath();
          tempctx.fill();
          //get color of clicked pixel
          var p = tempctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
          if (p[0]===255) { //mouseclick is inside zones[i] if red pixel is clicked
            this.updateSelectZoneValues(i);
            break;
          }
        }
      }
    }
  }
  getMousePos(canvas, evt) {
    //get click position X,Y on page
    if (evt.pageX !== undefined && evt.pageY !== undefined) {
      var x = evt.pageX;
  		var y = evt.pageY;
  	}
  	else {
  	  x = evt.clientX + document.body.scrollLeft +
  				document.documentElement.scrollLeft;
  		y = evt.clientY + document.body.scrollTop +
  				document.documentElement.scrollTop;
    }
    //calculate canvas offset on page
    var rect = canvas.getBoundingClientRect();
  	x -= rect.x;
  	y -= rect.y;
    //calculate page scroll
    x -= $(document).scrollLeft();
    y -= $(document).scrollTop();
    return {
      x: parseInt(x),
      y: parseInt(y),
      which: evt.nativeEvent.which
    };
  }

  drawPoly(points,selected,edited) {
    //draw single polygon
    if (points.length>0) {
      var canvas_draw = $('#canvasDraw')[0];
      var ctx_draw = canvas_draw.getContext('2d');
      ctx_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
      ctx_draw.globalAlpha=0.35;
      ctx_draw.fillStyle = "yellow";
      if (selected) ctx_draw.fillStyle = "red"; //selected zone polygon is drawn red
      if (edited) ctx_draw.fillStyle = "darkorange"; //selected zone polygon is drawn red
      ctx_draw.beginPath();
      ctx_draw.moveTo(points[0].x, points[0].y);
      for(var item=1 ; item < points.length ; item++ ){ctx_draw.lineTo( points[item].x , points[item].y )}
      ctx_draw.closePath();
      ctx_draw.fill();
      ctx_draw.globalAlpha=1;

      if (!edited) {
        //draw corner points
        for( item=0 ; item < points.length ; item++ ) {
          ctx_draw.fillStyle = "yellow";
          ctx_draw.beginPath();
          ctx_draw.arc(points[item].x , points[item].y, 2, 0, Math.PI*2, false);
          ctx_draw.closePath();
          ctx_draw.fill();
        }
      }
    }
  }
  drawAll()  {
    //draw polygon for every existing zone
    var canvas_draw = $('#canvasDraw')[0];
    var canvas_zones = $('#canvasZones')[0];
    this.clearAll();
    var ctx_draw = canvas_draw.getContext('2d');
    var ctx_zones = canvas_zones.getContext('2d');
    if (this.zones.length) {
        for (var i =0; i < this.zones.length; i++) {
          this.drawPoly(this.zones[i].ZonePoints,this.zones[i].Selected,this.zones[i].IsEdited); //draw zone[i] polygon on canvasDraw
          ctx_zones.drawImage(canvas_draw,0,0); //paste zone[i] polygon on cnavasZones
        }
    }
    ctx_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
  }
  clearAll() {
    //clear canvasDraw and canvasZones
    var canvas_draw = $('#canvasDraw')[0];
    var canvas_zones = $('#canvasZones')[0];
    var ctx_draw = canvas_draw.getContext('2d');
    var ctx_zones = canvas_zones.getContext('2d');
    ctx_zones.clearRect(0, 0, canvas_zones.width, canvas_zones.height);
    ctx_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
  }
  clearCanvas() {
    this.stopDraw(0); //stop drawing new polygon
    this.clearAll();
  }
  stopDraw(apply) {
    //finish drawing polygon
    var canvas_draw = $('#canvasDraw')[0];
    var ctx_draw = canvas_draw.getContext('2d');
    this.zoneDrawingActive = 0;
    this.toggleBtnCancelDrawVisible(false);
    if (apply === 1) { //if polygon should by saved
      if (this.drawnPolygon.length>2) { //polygon must have at least 3 points
        this.addZone();
      }
      else {
        if (this.zones.length>0) this.zones[this.selectedZoneIndex()].IsEdited = false;
      }
    }
    else {
      this.drawnPolygon = [];
      if (this.zones.length>0) this.zones[this.selectedZoneIndex()].IsEdited = false;
      ctx_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
      this.setState({ btnStartDrawText: "Add Zone", btnStartDrawIcon: "edit" });
    }
    this.drawAll();
  }
  toggleDraw() {
    //Button Add Zone / Apply
    if (this.zoneDrawingActive) {
      this.zoneDrawingActive = 0;
      this.setState({ btnStartDrawText: "Add Zone", btnStartDrawIcon: "edit" });
      this.toggleBtnCancelDrawVisible(false);
      if (this.drawnPolygon.length>2) {
        this.addZone();
      }
      else {
        if (this.zones.length>0) this.zones[this.selectedZoneIndex()].IsEdited = false;
      }
      this.drawAll();
    }
    else {
      this.zoneDrawingNew = true;
      this.zoneDrawingActive = 1;
      this.setState({ btnStartDrawText: "Apply", btnStartDrawIcon: "check" });
      this.drawnPolygon = [];
      this.toggleBtnCancelDrawVisible(true);
    }
  }
  drawNewPoints() {
    this.zoneDrawingNew = false;
    this.zones[this.selectedZoneIndex()].IsEdited = true;
    this.drawAll();
    this.zoneDrawingActive = 1;
    this.setState({ btnStartDrawText: "Apply", btnStartDrawIcon: "check" });
    this.drawnPolygon = [];
    this.toggleBtnCancelDrawVisible(true);
  }

  loadCamerasData() {
    this.cameraList = this.props.cameras;
        var cameraNames = [];
        for (var i =0; i < this.cameraList.length; i++) {
          cameraNames.push(this.cameraList[i].name);
        }
        if (cameraNames.length>0) {
          this.cameraListSelectedIndex = 0;
          if (this.props.id !== undefined) {
            for (i =0; i < this.cameraList.length; i++) {
              if (parseInt(this.cameraList[i].id) === parseInt(this.props.id)) {
                this.cameraListSelectedIndex = i;
                break;
              }
            }
          }
          else {
            this.setState({allowCamSelect: true});
          }
          this.setState({selectCamValues: cameraNames, selectCamValue: cameraNames[this.cameraListSelectedIndex]});
        }
        this.setState({camStatus: "disconnected"});
  }
  selectedCamChanged(value) {
    var selected = -1;
    for (var i =0; i < this.state.selectCamValues.length; i++) {
      if (this.state.selectCamValues[i] === value) {
        selected=i;
        break;
      }
    }
    this.cameraListSelectedIndex = selected;
    this.setState({selectCamValue: value});
  }
  startTranscoding() {
    //get selected camera url
    var ind = this.cameraListSelectedIndex;
    var url;
    if (this.cameraList.length>0 && ind>=0){
      url = this.cameraList[ind].formatted_url;
    }
    //temporary for local test
    else {
      if (this.state.selectCamValue === "kam") url = 'rtsp://192.168.0.201:8554/test';
      else url = 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_175k.mov';
    }

    if (url.length > 0 ) {
      //connect to socket with stream

      // Create WebSocket connection with main server (to get stream server port)
      this.socket = new WebSocket(this.WSclient+"8081/");
      // Connection opened: send url to start ffmpeg
      this.socket.addEventListener('open', function (event) {
          this.socket.send(url);
      }.bind(this));

      // Listen for messages (Success with port when ffmpeg is started, then disconnect and connect jsmpeg player)
      this.socket.addEventListener('message', function (event) {
          var response = JSON.parse(event.data);
          if (response.text === "Success") {
            this.socket.close(4000);
            var canvas_cam = $('#canvasCam')[0];
            this.camPlayer = new JSMpeg.Player(this.WSclient+response.port+"/", {canvas: canvas_cam, disableGl: true});
          }
          else {
            //if not success show error from Websocket server
            message.error(response.text, 3);
          }
      }.bind(this));
    }
  }
  connectToCam() {
    //send request to start transcoding server (rtsp -> websocket)
    this.startTranscoding();

    this.camIsConnectingSec = 0;
    this.setState({camStatus: "connecting"});
    //check if camera is streaming
    this.checkCamStream();
  }
  checkCamStream = () => {
    if (this.camPlayer!=="") {
      if (this.camPlayer.getCurrentTime()>0) { //if stream received
        var canvas_cam = $('#canvasCam')[0];
        //scale camera stream resolution to 1024xHeight
        this.camFrameWidth = canvas_cam.width;
        this.camFrameHeight = canvas_cam.height;
        canvas_cam.width = Math.min(canvas_cam.width,1024);
        canvas_cam.height = canvas_cam.width * this.camFrameHeight / this.camFrameWidth ;
        this.toggleDivCanvasCamVisible(true);
        this.setState({camStatus: "connected"});
        this.camLastStreamSec = 0;
        this.streamWatchdog = setTimeout(this.checkCamStreamEnd, 5000);
      }
      else { //if no stream data available try again for max.10 seconds
        if (this.camIsConnectingSec>10) {
          message.error("Connection to Stream failed", 5);
          this.disconnectFromCam();
        }
        else {
          this.streamWatchdog = setTimeout(this.checkCamStream, 1000);
          this.camIsConnectingSec++;
        }
      }
    }
    else {
      if (this.camIsConnectingSec>10) {
        message.error("Connection to Stream failed", 5);
        this.disconnectFromCam();
      }
      else {
        this.streamWatchdog = setTimeout(this.checkCamStream, 1000);
        this.camIsConnectingSec++;
      }
    }
  }
  checkCamStreamEnd = () => {
    //check if stream is playing
    if (this.camPlayer!=="") {
      if (this.camPlayer.isPlaying) {
        if (this.camPlayer.getCurrentTime() > this.camLastStreamSec) {
          this.streamWatchdog = setTimeout(this.checkCamStreamEnd, 3000);
          this.camLastStreamSec = this.camPlayer.getCurrentTime();
        }
        else {
          this.disconnectFromCam();
          message.error("Stream disconnected", 5);
        }
      }
      else {
        this.streamWatchdog = setTimeout(this.checkCamStreamEnd, 3000);
      }
    }
  }
  disconnectFromCam() {
    //disconnect from current camera stream
    this.toggleDivCanvasCamVisible(false);
    if (this.camPlayer!=="") {
      this.camPlayer.destroy();
      this.camPlayer = "";
    }
    if (this.socket.readyState === 1) this.socket.close();
    clearTimeout(this.streamWatchdog);
    this.camLastStreamSec=0;
    this.setState({camStatus: "disconnected"});
  }
  captureCamFrame() {
    //capture frame for editing zones
    var canvas_draw = $('#canvasDraw')[0];
    var canvas_zones = $('#canvasZones')[0];
    var canvas_img = $('#canvasImg')[0];
    var canvas_cam = $('#canvasCam')[0];
    var ctx_img = canvas_img.getContext('2d');
    //clear any previous data and stop streaming
    this.deleteAllZones();
    this.camPlayer.stop();
    //calculate frame size (1024xHeight)
    this.toggleDivCanvasCamVisible(false);
    this.toggleDivCanvasVisible(true);
    canvas_img.width = 1024;
    canvas_img.height = canvas_img.width * this.camFrameHeight / this.camFrameWidth ;
    canvas_draw.height = canvas_img.height;
    canvas_zones.height = canvas_img.height;
    $("#divZones").height(canvas_img.height+10);
    this.toggleDivZonesVisible(true);
    this.toggleDivUpperMenuVisible(true);
    this.setState({camStatus: "captured"});
    //show frame on canvas and try to load configdata (zones)
    ctx_img.drawImage(canvas_cam, 0, 0, canvas_img.width, canvas_img.height);
    this.loadConfig();
  }
  finishCam() {
    //finish editing captured frame
    this.zoneDrawingActive = 0;
    this.toggleDivZonesVisible(false);
    this.toggleDivZonePropVisible(false);
    this.toggleDivCanvasVisible(false);
    this.toggleDivCanvasCamVisible(true);
    this.toggleDivUpperMenuVisible(false);
    this.toggleBtnCancelDrawVisible(false);
    this.setState({camStatus: "connected"});
    this.camPlayer.play();
  }

  addZone() {
    //create new zone with drawn polygon
    if (this.zoneDrawingNew) {
      var canvas_img = $('#canvasImg')[0];
      var zoneName ="Zone1";
      for (var i =0; i <= this.zones.length; i++) {
        zoneName = "Zone" + String(i+1);
        if (this.checkZoneName(zoneName)) break;
      }
      let prop = new ZoneProperties(zoneName,canvas_img.width,canvas_img.height);
      let newzone = new Zone(prop,this.drawnPolygon,-1);
      this.zones.push(newzone);
      this.updateSelectZoneValues();
    }
    else {
      this.zones[this.selectedZoneIndex()].ZonePoints = this.drawnPolygon;
    }
    this.zones[this.selectedZoneIndex()].IsEdited = false;
    this.drawnPolygon = [];
  }
  makeFullscreen () {
    if (this.selectedZoneIndex()>=0) {
      var canvas_img = $('#canvasImg')[0];
      this.drawnPolygon = [];
      this.drawnPolygon.push({"x":0, "y":0});
      this.drawnPolygon.push({"x":0, "y":canvas_img.height-1});
      this.drawnPolygon.push({"x":canvas_img.width-1, "y":canvas_img.height-1});
      this.drawnPolygon.push({"x":canvas_img.width-1, "y":0});
      this.zones[this.selectedZoneIndex()].ZonePoints = this.drawnPolygon;
      this.drawnPolygon = [];
      this.drawAll();
      this.forceUpdate();
    }
  }
  deleteZone() {
    //delete selected zone
    var ind = this.selectedZoneIndex();
    if (ind>-1) {
      this.zones.splice(ind,1);
      this.updateSelectZoneValues();
    }
  }
  deleteAllZones() {
    //delete all zones
    this.zones = [];
    this.updateSelectZoneValues();
  }
  selectedZoneChanged(value) {
    this.setState({selectZoneValue: value, inputTxtNameText: value});
    this.selectPolygon(value);
    //show Properties list
    var ind = this.selectedZoneIndex();
    if (ind>-1)  this.toggleDivZonePropVisible(true);
    else this.toggleDivZonePropVisible(false);
  }
  updateSelectZoneValues(indexToSelect) {
    //update component list
    var zoneNames = [];
    var zoneName = "";
    //if no paramater then select last element
    if (indexToSelect === undefined) indexToSelect = this.zones.length+1;
    for (var i =0; i < this.zones.length; i++) {
      if (i<=indexToSelect)zoneName=this.zones[i].Properties.Name;
      zoneNames.push(this.zones[i].Properties.Name);
    }
    this.setState({selectZoneValues: zoneNames, selectZoneValue: zoneName, inputTxtNameText: zoneName});
    this.selectPolygon(zoneName);
    if (zoneName!=="") this.toggleDivZonePropVisible(true);
    else this.toggleDivZonePropVisible(false);
  }
  selectPolygon(name) {
    //change property Selected of all existing zones (only one can be true)
    for (var i =0; i < this.zones.length; i++) {
        this.zones[i].Selected = false;
        if (this.zones[i].Properties.Name === name) this.zones[i].Selected = true;
    }
    //update canvas image
    this.drawAll();
  }
  selectedZoneIndex() {
    //get index of selected zone
    var ind = -1;
    for (var i =0; i < this.zones.length; i++) {
        if (this.zones[i].Selected) {
          ind = i;
          break;
        }
    }
    return ind;
  }
  checkZoneName(name) {
    //check if new name i unique
    var result = true;
    for (var i =0; i < this.zones.length; i++) {
      if (name===this.zones[i].Properties.Name) {
        result = false;
        break;
      }
    }
    return result;
  }

  updateProperties() {
    //update selected zone properties
    var ind = this.selectedZoneIndex();
    if (this.checkZoneName($("#inputTxtName").val())) {
      this.zones[ind].Properties.Name = $("#inputTxtName").val();
      this.updateSelectZoneValues(ind);
    }
    else {
      $("#inputTxtName").val(this.zones[ind].Properties.Name);
      message.error("Name exists", 5);
    }
  }

  loadConfig() {
    //get configured zones data from API
    var canvas_img = $('#canvasImg')[0];
    var ind = this.cameraListSelectedIndex;
    if (this.cameraList.length >0 && ind>=0) {

     var jsonzones = xah_deep_copy_array_or_object(this.cameraList[ind].camera_zones)
          this.zones =[];
          //create local structures with zones
          for (var i =0; i < jsonzones.length; i++) {
            let prop = new ZoneProperties(jsonzones[i].name,canvas_img.width,canvas_img.height);
            let newzone = new Zone(prop,jsonzones[i].polygons,jsonzones[i].id);
            if (newzone.ZonePoints.length>2) {
              this.zones.push(newzone);
            }
          }
          this.scaleZones(this.zones,{"Width":this.camFrameWidth, "Height":this.camFrameHeight},{"Width":canvas_img.width, "Height":canvas_img.height});
          this.updateSelectZoneValues(0);
    }
  }
  saveConfig() {
    const { saveCameraZones } = this.props
    var canvas_img = $('#canvasImg')[0];
    var ind = this.cameraListSelectedIndex;
    //id of camera
    var camId;
    if (this.cameraList.length >0 && ind>=0) camId = this.cameraList[ind].id; else camId = "-1";
    //create deep copy for scaling
    var scaledzones = xah_deep_copy_array_or_object(this.zones);
    this.scaleZones(scaledzones,{"Width":canvas_img.width, "Height":canvas_img.height},{"Width":this.camFrameWidth, "Height":this.camFrameHeight});
    //create data to send to API
    var jsonzones = [];
    for (var i =0; i < scaledzones.length; i++) {
      let newzone = new ZoneJson(scaledzones[i],camId);
      jsonzones.push(newzone);
    }
    saveCameraZones(camId, jsonzones)
  }

  scaleZones(z,from,to) {
    //Scale point in every zone polygon (canvas size != frame size)
    if (z.length) {
      for (var j =0; j < z.length; j++) {
        if (z[j].ZonePoints.length) {
          for (var i =0; i < z[j].ZonePoints.length; i++) {
              this.scalePoint(z[j].ZonePoints[i],from,to);
          }
        }
      }
    }
  }
  scalePoint(p,from,to) {
    if (from.Width > 1 && from.Height > 1)
    {
      var x = p.x * (to.Width - 1) / (from.Width - 1);
      var y = p.y * (to.Height - 1) / (from.Height - 1);
      p.x = Math.min(Math.round(x), to.Width - 1);
      p.y = Math.min(Math.round(y), to.Height - 1);
    }
  }
}

class Zone {
  constructor(properties,points,id) {
    this.Properties = properties; //Zone properties
    this.ZonePoints = points;     //Zone polygon
    this.Selected = true;         //is Zone selected (only for show)
    this.IsEdited = false;        //drawing new points (only for show)
    this.id = id;                 //id for API (-1 when new zone)
  }
}
class ZoneProperties {
    constructor(name,width,height) {
        this.ImageHeight = height;   //used for scaling between camera frame size and canvas size
        this.ImageWidth = width;   //used for scaling between camera frame size and canvas size
        this.Name = name;           //Zone name
    }
}
class ZoneJson {
  //structure sent to API
  constructor(zone,camid) {
    this.id = zone.id;
    this.name = zone.Properties.Name;
    this.camera = camid;
    this.polygons = zone.ZonePoints;
  }
}

const xah_deep_copy_array_or_object = (obj => JSON.parse ( JSON.stringify(obj) ) );

export default ZoneConfig;
