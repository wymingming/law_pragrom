 <template>
  <el-container style="margin:5px 5px 5px 5px;border: 1px solid #eee;">
    <el-tabs stretch v-model="activeTab" type="border-card" style="width:300px;display:table-cell;" @tab-click="tabChange">
      <el-tab-pane label="未标注" name="untagged">
        <el-col>
          <el-menu class="el-menu-vertical-demo">
            <el-menu-item v-for="file in framesFile" :key="file.id" @click.native="chooseFrameFile(file)" :index="generateName('untagged_', file.id)">{{file.name}}</el-menu-item>
          </el-menu>
          <el-pagination style="text-align: center; margin-top: 10px;"
            @current-change="untaggedPaginationChange"
            small
            layout="prev, pager, next"
            :total="filesNum"
            :page-size="10"
          ></el-pagination>
        </el-col>
      </el-tab-pane>
      <el-tab-pane label="已标注" name="tagged">
        <el-col>
          <el-menu class="el-menu-vertical-demo">
            <el-menu-item v-for="file in framesFile" :key="file.id" @click.native="chooseFrameFile(file)" :index="generateName('tagged_', file.id)">{{file.name}}</el-menu-item>
          </el-menu>
          <el-pagination style="text-align: center; margin-top: 10px;"
            @current-change="taggedPaginationChange"
            small
            layout="prev, pager, next"
            :total="filesNum"
            :page-size="10"
          ></el-pagination>
        </el-col>
      </el-tab-pane>
    </el-tabs>
    <el-container>
      <el-header style="text-align: right; font-size: 14px;height: 40px">
        <el-dropdown @command="dropdownCommand">
          <i class="el-icon-setting" style="margin-right: 15px"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">注销</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span>姓名</span>
      </el-header>
      <el-main>
        <!-- <p>
          XML
          <input
            type="file"
            id="xmlFile"
            ref="xmlFile"
            accept=".xml"
            disabled="true"
            v-on:change="importXml"
          >
        </p>-->
        <h3>{{ this.activeFile.name }}</h3>
        <div class="describe">{{ this.activeFile.describe }}</div>
        <div id="doodle" ref="doodle" @mousemove="doodleMousemove" @click="doodleClick">
          <canvas id="canvas" ref="canvas"></canvas>
        </div>
        <player ref="player"></player>
        <slider ref="slider"></slider>
        <el-row :gutter="10">
          <el-col :span="3" style="margin-top: 10px;">
            <el-button id="play" type="primary" round @click="playClicked">播放</el-button>
            <el-button id="pause" type="primary" round @click="pauseClicked" style="display:none; margin-left: 0px;">暂停</el-button>
          </el-col>
          <el-col :span="4">
            <p>播放倍率：
              <el-input type="number" id="speed" v-model="speed" value=1 min=1 max=10 style="width: 80px;" size="small"></el-input>
            </p>
          </el-col>
          <el-col :span="4">
            <p>快进/退帧数：
              <el-input type="number" id="framesNum" v-model="framesNum" value=1 min=1 max=10 style="width: 80px;" size="small"></el-input>
            </p>
          </el-col>
        </el-row>
        <el-card>
          <div slot="header" class="clearfix">
            <span style="font-weight:bold;font-size:18px">标签栏</span><span> （按“n”以新建标签）</span>
            <el-button style="float: right;" type="primary" @click="submit" size="mini">提交</el-button>
          </div>
          <div id="objects">
            <el-row :gutter="10">
              <el-col :span="4" v-for="(tag, i) in tagCards" :key="tag.name">
                <el-card shadow="hover" :id="tag.name">
                  <div slot="header" class="clearfix">
                    <span>标签{{i}}</span>
                    <el-button
                      style="float: right; padding: 3px 0"
                      type="text"
                      @click="tagCardDelete(tag)"
                    >删除</el-button>
                  </div>
                  <p v-for="o in behaviorNum" :key="o">
                    <input
                      type="checkbox"
                      :name="generateName('behavior', o)"
                      :value="generateName('behavior', o)"
                    >
                    异常行为{{o}}
                  </p>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import "jquery";
import jquery from "jquery";
import player from "./player";
import slider from "./slider";

let framesManager = new FramesManager();
let annotatedObjectsTracker = new AnnotatedObjectsTracker(framesManager);

export default {
  components: { player, slider },
  data: function() {
    return {
      config: {
        // Should be higher than real FPS to not skip real frames
        // Hardcoded due to JS limitations
        fps: 30,
        // Low rate decreases the chance of losing frames with poor browser performances
        playbackRate: 0.4,
        // Format of the extracted frames
        imageMimeType: "image/jpeg",
        imageExtension: ".jpg",
        // Name of the extracted frames zip archive
        framesZipFilename: "extracted-frames.zip"
      },
      labelSubmitted: false,  // 标签是否提交
      mouse: {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
      },
      tmpAnnotatedObject: {},
      framesFile: [],         // 文件集
      filesNum: 0,            // 文件总数
      framesFileTotal: 0,     // 文件总数
      activeFile: {},         // 当前展示的文件
      speed: 1,               // 播放速度
      framesNum: 1,           // 快进/退帧数
      behaviorNum: 5,         // 异常行为数量
      tagCardIndex: 0,        // 标签序号
      tagCards: [],           // 标签数组
      activeTab: "untagged"   // 当前展示的tab
    };
  },
  mounted() {
    // window.addEventListener('message', (e) => {
    //   if (e.origin !== 'http://localhost:8080') {
    //     return;
    //   }
    // });

    // 请求后台数据
    this.clipsFind(1, 0);
    this.$refs.slider.reset();
    var vueThis = this;
    window.onkeydown = function(e) {
      let preventDefault = true;
      let framesNum = parseInt(vueThis.framesNum);

      if (e.keyCode === 32) {
        // space
        vueThis.$refs.player.toogle(
          vueThis.config,
          framesManager,
          annotatedObjectsTracker
        );
      } else if (e.keyCode === 78) {
        // n
        vueThis.$refs.doodle.style.cursor = "crosshair";
        vueThis.labelSubmitted = false;
      } else if (e.keyCode === 27) {
        // escape
        if (Object.keys(vueThis.tmpAnnotatedObject).length != 0) {
          vueThis.$refs.doodle.removeChild(vueThis.tmpAnnotatedObject.dom);
          vueThis.tmpAnnotatedObject = null;
        }

        vueThis.$refs.doodle.style.cursor = "default";
      } else if (e.keyCode === 37) {
        // left
        vueThis.$refs.player.seek(
          vueThis.$refs.player.currentFrame - framesNum,
          framesManager,
          annotatedObjectsTracker
        );
      } else if (e.keyCode === 39) {
        // right
        vueThis.$refs.player.seek(
          vueThis.$refs.player.currentFrame + framesNum,
          framesManager,
          annotatedObjectsTracker
        );
      } else {
        preventDefault = false;
      }

      if (preventDefault) {
        e.preventDefault();
      }
    };
  },
  methods: {
    dropdownCommand: function(command){
      if(command === 'logout'){
        this.$message('logout');
      }
    },

    generateName: function(name, index) {
      return name + index;
    },

    tabChange: function(tab){
      let tagged = 0;
      if(tab.name === 'tagged'){
        tagged = 2;
      }
      this.clipsFind(1, tagged);
    },
    
    untaggedPaginationChange(val) {
      this.clipsFind(val, 0);
    },

    taggedPaginationChange(val) {
      this.clipsFind(val, 2);
    },

    clipsFind: function(val, tagged){
      this.$http.get('http://192.168.1.120:9090/annotation/clips/find',{
        params: {
          currentPage: val,
          pageSize: 10, 
          tagged: tagged
        }
      }).then(
        response => {
          this.filesNum = response.body.result.total;
          this.framesFile = response.body.result.records;
        }
      ).catch(function() {
          this.$message.error("list error!");
      });
    },

    chooseFrameFile: function(file) {
      if (
        file.id === this.activeFile.id || // 同一个文件 ||
        (annotatedObjectsTracker.annotatedObjects.length > 0 && // 标签数大于0
        !this.labelSubmitted && // && （修改后）未提交
          confirm("标签未提交或已增减，是否停止切换文件？")) // && 用户停止
      ) return;
      this.clearAllAnnotatedObjects();
      let playerComponent = this.$refs.player;
      playerComponent.initialize();

      this.activeFile = file;
      var vueThis = this;
      new JSZip.external.Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent("http://" + file.address, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      })
        .then(function(data) {
          let promise = extractFramesFromZip(
            vueThis.config,
            JSZip.loadAsync(data),
            file.name
          );

          promise.then(frames => {
            if (frames.totalFrames() > 0) {
              frames.getFrame(0).then(blob => {
                blobToImage(blob).then(img => {
                  vueThis.initializeCanvasDimensions(img);
                  vueThis.$refs.canvas.getContext("2d").drawImage(img, 0, 0);

                  framesManager.set(frames);
                  vueThis.$refs.slider.init(
                    framesManager.frames.totalFrames() - 1,
                    frameNumber =>
                      playerComponent.seek(
                        frameNumber,
                        framesManager,
                        annotatedObjectsTracker
                      )
                  );
                  playerComponent.ready();
                  $("#xmlFile_t").removeClass("disabled");
                });
              });
            }
          });
        })
        .catch(function(err) {
          vueThis.$message.error('failed to read the file.');
        });
    },

    clearAllAnnotatedObjects: function() {
      while (annotatedObjectsTracker.annotatedObjects.length > 0) {
        this.clearAnnotatedObject(0);
      }
      this.tagCards = [];
    },

    initializeCanvasDimensions: function(img) {
      this.$refs.doodle.style.width = img.width + "px";
      this.$refs.doodle.style.height = img.height + "px";
      this.$refs.canvas.width = img.width;
      this.$refs.canvas.height = img.height;
      this.$refs.slider.style.width = img.width + "px";
    },

    importXml: function(event) {
      var improtXmlComponent = event.target;
      if (improtXmlComponent.files.length != 1) {
        return;
      }

      var reader = new FileReader();
      reader.onload = e => {
        if (e.target.readyState != 2) {
          return;
        }

        if (e.target.error) {
          throw "file reader error";
        }

        let xml = $($.parseXML(e.target.result));
        let objects = xml.find("object");
        for (let i = 0; i < objects.length; i++) {
          let object = $(objects[i]);
          let name = object.find("name").text();
          let id = object.find("id").text();
          let labels = object.find("label"); //  12.3 新增 wym

          let annotatedObject = new AnnotatedObject();
          annotatedObject.name = name;
          annotatedObject.id = id;
          annotatedObject.labels = labels; //  12.3 新增 wym
          annotatedObject.dom = this.newBboxElement();
          annotatedObjectsTracker.annotatedObjects.push(annotatedObject);

          this.interactify(annotatedObject.dom, (x, y, width, height) => {
            let bbox = new BoundingBox(x, y, width, height);
            annotatedObject.add(
              new AnnotatedFrame(this.$refs.player.currentFrame, bbox, true)
            );
          });

          this.addAnnotatedObjectControls(annotatedObject);

          let lastFrame = -1;
          let polygons = object.find("polygon");
          for (let j = 0; j < polygons.length; j++) {
            let polygon = $(polygons[j]);
            let frameNumber = parseInt(polygon.find("t").text());
            let pts = polygon.find("pt");
            let topLeft = $(pts[0]);
            let bottomRight = $(pts[2]);
            let isGroundThrough = parseInt(topLeft.find("l").text()) == 1;
            let x = parseInt(topLeft.find("x").text());
            let y = parseInt(topLeft.find("y").text());
            let w = parseInt(bottomRight.find("x").text()) - x;
            let h = parseInt(bottomRight.find("y").text()) - y;

            if (lastFrame + 1 != frameNumber) {
              let annotatedFrame = new AnnotatedFrame(
                lastFrame + 1,
                null,
                true
              );
              annotatedObject.add(annotatedFrame);
            }

            let bbox = new BoundingBox(x, y, w, h);
            let annotatedFrame = new AnnotatedFrame(
              frameNumber,
              bbox,
              isGroundThrough
            );
            annotatedObject.add(annotatedFrame);

            lastFrame = frameNumber;
          }

          if (lastFrame + 1 < framesManager.frames.totalFrames()) {
            let annotatedFrame = new AnnotatedFrame(lastFrame + 1, null, true);
            annotatedObject.add(annotatedFrame);
          }
        }

        this.$refs.player.drawFrame(
          this.$refs.player.currentFrame,
          annotatedObjectsTracker
        );
      };
      reader.readAsText(improtXmlComponent.files[0]);
    },

    newBboxElement: function() {
      let dom = document.createElement("div");
      dom.className = "bbox";
      this.$refs.doodle.appendChild(dom);
      return dom;
    },

    addAnnotatedObjectControls: function(annotatedObject) {
      let bbox;
      let jquery = $(annotatedObject.dom);
      let position = jquery.position();
      bbox = new BoundingBox(
        Math.round(position.left),
        Math.round(position.top),
        Math.round(jquery.width()),
        Math.round(jquery.height())
      );
      annotatedObject.add(
        new AnnotatedFrame(this.$refs.player.currentFrame, bbox, true)
      );

      window.setTimeout(function(){
        let input_t = $("#" + annotatedObject.id).find("input");
        for (let i = 0; i < input_t.length; i++) {
          let labels = annotatedObject.labels;
          if (labels) {
            //   12.3 新增 wym
            for (let j = 0; j < labels.length; j++) {
              if (labels[j] === input_t.eq(i).attr("name")) {
                input_t.eq(i).attr("checked", true);
                break;
              }
            }
          }
        }
      }, 300);
    },

    tagCardDelete: function(tag) {
      let tagCards = this.tagCards;
      for (
        let i = 0;
        i < annotatedObjectsTracker.annotatedObjects.length;
        i++
      ) {
        if (tag.annotatedObject === annotatedObjectsTracker.annotatedObjects[i]) {
          this.clearAnnotatedObject(i);
          this.labelSubmitted = false;
          break;
        }
      }
      this.tagCards = tagCards.filter(t => t.name !== tag.name);
    },

    clearAnnotatedObject: function(i) {
      let annotatedObject = annotatedObjectsTracker.annotatedObjects;
      $(annotatedObject[i].dom).remove();
      annotatedObject.splice(i, 1);
    },

    playClicked: function() {
      this.$refs.player.play(
        this.config,
        framesManager,
        annotatedObjectsTracker
      );
    },

    pauseClicked: function() {
      this.$refs.player.pause();
    },

    generateJSON: function() {
      let tagJSON = {};
      tagJSON.objects = [];
      for (
        let i = 0;
        i < annotatedObjectsTracker.annotatedObjects.length;
        i++
      ) {
        let annotatedObject = annotatedObjectsTracker.annotatedObjects[i];
        let tempObject = {id: annotatedObject.id, labels: [], polygons: []};
        let input_checkboxs = $("#" + tempObject.id).find("input[type='checkbox']");
        for (let j = 0; j < input_checkboxs.length; j++) {
          //每个框里面的内容
          let ischecked = input_checkboxs[j]; //拿到每个框的checkbox
          if (ischecked.checked) {
            tempObject.labels.push(ischecked.name);
          }
        }
        let totalFrames = framesManager.frames.totalFrames();
        for (let frameNumber = 0; frameNumber < totalFrames; frameNumber++) {
          let annotatedFrame = annotatedObject.get(frameNumber);
          if (annotatedFrame == null) {
            this.$message(
              "Play the video in full before downloading the XML so that bounding box data is available for all frames."
            );
            return;
          }
          let bbox = annotatedFrame.bbox;
          if (bbox != null) {
            let isGroundThrugh = annotatedFrame.isGroundTruth ? 1 : 0;
            let tempPolygon = {};
            tempPolygon.t = frameNumber;
            tempPolygon.pt = [
              {
                x: bbox.x,
                y: bbox.y,
                l: isGroundThrugh
              },
              {
                x: bbox.x,
                y: bbox.y + bbox.height,
                l: isGroundThrugh
              },
              {
                x: bbox.x + bbox.width,
                y: bbox.y + bbox.height,
                l: isGroundThrugh
              },
              {
                x: bbox.x + bbox.width,
                y: bbox.y,
                l: isGroundThrugh
              }
            ];
            tempObject.polygons.push(tempPolygon);
          }
        }
        tagJSON.objects.push(tempObject);
      }
      return tagJSON;
    },

    submit: function() {
      if(this.tagCards.length <= 0) {
        this.$message({
          message: '请按"n"进行标注后再提交。',
          type: 'warning'
        });
        return;
      }

      let tagJSON = this.generateJSON();
      if(tagJSON === null || tagJSON === undefined) return;

      this.$http.post("http://192.168.1.120:9090/annotation/clips/tag", 
        JSON.stringify({id: this.activeFile.id, tag: "'" + JSON.stringify(tagJSON) + "'"})
      ,{emulateJSON: true})
      .then(res => {
        this.$message({
          message: "提交成功。",
          type: 'success'
        });
        this.labelSubmitted = true;
      })
      .catch(res => {
        this.$message.error("提交失败。");
      });
    },

    interactify: function(dom, onChange) {
      let bbox = $(dom);
      bbox.addClass("bbox");

      let createHandleDiv = className => {
        let handle = document.createElement("div");
        handle.className = className;
        bbox.append(handle);
        return handle;
      };

      bbox.resizable({
        containment: "parent",
        handles: {
          n: createHandleDiv("ui-resizable-handle ui-resizable-n"),
          s: createHandleDiv("ui-resizable-handle ui-resizable-s"),
          e: createHandleDiv("ui-resizable-handle ui-resizable-e"),
          w: createHandleDiv("ui-resizable-handle ui-resizable-w")
        },
        stop: (e, ui) => {
          let position = bbox.position();
          onChange(
            Math.round(position.left),
            Math.round(position.top),
            Math.round(bbox.width()),
            Math.round(bbox.height())
          );
        }
      });

      bbox.draggable({
        containment: "parent",
        handle: createHandleDiv("handle center-drag"),
        stop: (e, ui) => {
          let position = bbox.position();
          onChange(
            Math.round(position.left),
            Math.round(position.top),
            Math.round(bbox.width()),
            Math.round(bbox.height())
          );
        }
      });
    },

    doodleMousemove: function(event) {
      let ev = event || window.event;
      if (ev.pageX) {
        this.mouse.x = ev.pageX;
        this.mouse.y = ev.pageY;
      } else if (ev.clientX) {
        this.mouse.x = ev.clientX;
        this.mouse.y = ev.clientY;
      }
      this.mouse.x -= doodle.offsetLeft;
      this.mouse.y -= doodle.offsetTop;

      if (Object.keys(this.tmpAnnotatedObject).length != 0) {
        this.tmpAnnotatedObject.width = Math.abs(
          this.mouse.x - this.mouse.startX
        );
        this.tmpAnnotatedObject.height = Math.abs(
          this.mouse.y - this.mouse.startY
        );
        this.tmpAnnotatedObject.x =
          this.mouse.x - this.mouse.startX < 0
            ? this.mouse.x
            : this.mouse.startX;
        this.tmpAnnotatedObject.y =
          this.mouse.y - this.mouse.startY < 0
            ? this.mouse.y
            : this.mouse.startY;

        this.tmpAnnotatedObject.dom.style.width =
          this.tmpAnnotatedObject.width + "px";
        this.tmpAnnotatedObject.dom.style.height =
          this.tmpAnnotatedObject.height + "px";
        this.tmpAnnotatedObject.dom.style.left =
          this.tmpAnnotatedObject.x + "px";
        this.tmpAnnotatedObject.dom.style.top =
          this.tmpAnnotatedObject.y + "px";
      }
    },

    doodleClick: function(event) {
      if (this.$refs.doodle.style.cursor != "crosshair") {
        return;
      }

      if (Object.keys(this.tmpAnnotatedObject).length != 0) {
        let annotatedObject = new AnnotatedObject();
        annotatedObject.dom = this.tmpAnnotatedObject.dom;
        let bbox = new BoundingBox(
          this.tmpAnnotatedObject.x,
          this.tmpAnnotatedObject.y,
          this.tmpAnnotatedObject.width,
          this.tmpAnnotatedObject.height
        );
        annotatedObject.add(
          new AnnotatedFrame(this.$refs.player.currentFrame, bbox, true)
        );
        annotatedObjectsTracker.annotatedObjects.push(annotatedObject);
        this.tmpAnnotatedObject = {};

        this.interactify(annotatedObject.dom, (x, y, width, height) => {
          let bbox = new BoundingBox(x, y, width, height);
          annotatedObject.add(
            new AnnotatedFrame(this.$refs.player.currentFrame, bbox, true)
          );
        });

        this.tagCardIndex ++;
        let tagCardName = this.generateName('tagCard_', this.tagCardIndex);
        annotatedObject.id = tagCardName;
        this.tagCards.push({name: tagCardName, annotatedObject: annotatedObject});

        this.addAnnotatedObjectControls(annotatedObject);

        this.$refs.doodle.style.cursor = "default";
      } else {
        this.mouse.startX = this.mouse.x;
        this.mouse.startY = this.mouse.y;

        let dom = this.newBboxElement();
        dom.style.left = this.mouse.x + "px";
        dom.style.top = this.mouse.y + "px";
        this.tmpAnnotatedObject = { dom: dom };
      }
    }
  }
};
</script>
<style>
.output {
  font-family: monospace;
  font-weight: bold;
}

#doodle {
  position: relative;
  width: 0px;
  height: 0px;
  z-index: 2;
}

#canvas {
  z-index: 1;
}

.bbox {
  border: 1px solid #ff0000;
  position: absolute;
  z-index: 3;
}

.handle,
.ui-resizable-handle {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(255, 0, 0, 0.5);
  background-color: rgba(255, 255, 0, 0.05);
  position: absolute;
}

.center-drag {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: move;
}

.ui-resizable-n {
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: n-resize;
}

.ui-resizable-s {
  left: 50%;
  bottom: 0%;
  transform: translate(-50%, 50%);
  cursor: s-resize;
}

.ui-resizable-w {
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: w-resize;
}

.ui-resizable-e {
  right: 0%;
  top: 50%;
  transform: translate(50%, -50%);
  cursor: e-resize;
}

.ui-slider {
  position: relative;
  text-align: left;
  height: 0.8em;
}

.ui-slider-handle {
  position: absolute;
  z-index: 2;
  width: 1.2em;
  height: 1.2em;
  cursor: default;
  -ms-touch-action: none;
  touch-action: none;
  top: -0.3em;
  margin-left: -0.6em;
}

.ui-widget.ui-widget-content {
  border: 1px solid #d3d3d3;
}

.ui-state-default {
  border: 1px solid #d3d3d3;
  background-color: #e6e6e6;
}

.ui-state-hover,
.ui-state-focus {
  border: 1px solid #999999;
  background-color: #dadada;
}

.ui-state-active {
  border: 1px solid #aaaaaa;
  background-color: #ffffff;
}

.ui-state-disabled {
  opacity: 0.35;
}

.ui-corner-all {
  border-radius: 4px;
}
.fileinput-button {
  position: relative;
  display: inline-block;
}

.fileinput-button input {
  position: absolute;
  right: 0px;
  top: 0px;
  opacity: 0;
  -ms-filter: "alpha(opacity=0)";
  font-size: 1px;
}
.bs-example {
  position: relative;
  padding: 45px 15px 15px;
  margin: 0 -15px 15px;
  border-color: #e5e5e5 #eee #eee;
  border-style: solid;
  border-width: 1px 0;
  -webkit-box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.05);
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  width: 100px;
}

.bs-example:after {
  position: absolute;
  top: 15px;
  left: 15px;
  font-size: 12px;
  font-weight: 700;
  color: #959595;
  text-transform: uppercase;
  letter-spacing: 1px;
  content: "视频倍率";
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.el-header {
  /* background-color: #B3C0D1; */
  background-color: #409EFF;
  color: #333;
  line-height: 40px;
}

.el-aside {
  color: #333;
}
</style>
