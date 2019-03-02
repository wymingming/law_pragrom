<template></template>
<script>
export default {
  data: function() {
    return {
      currentFrame: 0,
      isPlaying: false,
      isReady: false,
      timeout: null
    };
  },
  methods: {
    initialize: function() {
      this.currentFrame = 0;
      this.isPlaying = false;
      this.isReady = false;
      let playButton = document.getElementById("play");
      let pauseButton = document.getElementById("pause");
      playButton.disabled = true;
      playButton.style.display = "block";
      pauseButton.disabled = true;
      pauseButton.style.display = "none";
    },

    ready: function() {
      this.isReady = true;

      let playButton = document.getElementById("play");
      playButton.disabled = false;
    },

    seek: function(frameNumber, framesManager, annotatedObjectsTracker) {
      if (!this.isReady) {
        return;
      }

      this.pause();

      if (
        frameNumber >= 0 &&
        frameNumber < framesManager.frames.totalFrames()
      ) {
        this.drawFrame(frameNumber, annotatedObjectsTracker);
        this.currentFrame = frameNumber;
      }else if(frameNumber < 0){
        this.drawFrame(0, annotatedObjectsTracker);
        this.currentFrame = 0;
      }else {
        this.drawFrame(framesManager.frames.totalFrames() - 1, annotatedObjectsTracker);
        this.currentFrame = framesManager.frames.totalFrames() - 1;
      }
    },

    play: function(config, framesManager, annotatedObjectsTracker) {
      if (!this.isReady) {
        return;
      }

      this.isPlaying = true;

      let playButton = document.getElementById("play");
      let pauseButton = document.getElementById("pause");
      playButton.disabled = true;
      playButton.style.display = "none";
      pauseButton.disabled = false;
      pauseButton.style.display = "block";

      this.nextFrame(config, framesManager, annotatedObjectsTracker);
    },

    pause: function() {
      if (!this.isReady) {
        return;
      }

      this.isPlaying = false;
      if (this.timeout != null) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      let playButton = document.getElementById("play");
      let pauseButton = document.getElementById("pause");
      pauseButton.disabled = true;
      pauseButton.style.display = "none";
      playButton.disabled = false;
      playButton.style.display = "block";
    },

    toogle: function(config, framesManager, annotatedObjectsTracker) {
      if (!this.isPlaying) {
        this.play(config, framesManager, annotatedObjectsTracker);
      } else {
        this.pause();
      }
    },

    nextFrame: function(config, framesManager, annotatedObjectsTracker) {
      if (!this.isPlaying) {
        return;
      }

      if (this.currentFrame >= framesManager.frames.totalFrames()) {
        this.done();
        return;
      }

      this.drawFrame(this.currentFrame, annotatedObjectsTracker).then(() => {
        this.currentFrame++;
        let speedInput = document.querySelector("#speed");
        this.timeout = setTimeout(
          () => this.nextFrame(config, framesManager, annotatedObjectsTracker),
          1000 / (config.fps * parseFloat(speedInput.value))
        );
      });
    },

    drawFrame: function(frameNumber, annotatedObjectsTracker) {
      return new Promise((resolve, _) => {
        annotatedObjectsTracker
          .getFrameWithObjects(frameNumber)
          .then(frameWithObjects => {
            document
              .querySelector("#canvas")
              .getContext("2d")
              .drawImage(frameWithObjects.img, 0, 0);

            for (let i = 0; i < frameWithObjects.objects.length; i++) {
              let object = frameWithObjects.objects[i];
              let annotatedObject = object.annotatedObject;
              let annotatedFrame = object.annotatedFrame;
              if (annotatedFrame.isVisible()) {
                annotatedObject.dom.style.display = "block";
                annotatedObject.dom.style.width =
                  annotatedFrame.bbox.width + "px";
                annotatedObject.dom.style.height =
                  annotatedFrame.bbox.height + "px";
                annotatedObject.dom.style.left = annotatedFrame.bbox.x + "px";
                annotatedObject.dom.style.top = annotatedFrame.bbox.y + "px";
              } else {
                annotatedObject.dom.style.display = "none";
                annotatedObject.visible.prop("checked", false);
              }
            }

            let shouldHideOthers = frameWithObjects.objects.some(
              o => o.annotatedObject.hideOthers
            );
            if (shouldHideOthers) {
              for (let i = 0; i < frameWithObjects.objects.length; i++) {
                let object = frameWithObjects.objects[i];
                let annotatedObject = object.annotatedObject;
                if (!annotatedObject.hideOthers) {
                  annotatedObject.dom.style.display = "none";
                }
              }
            }

            this.$parent.$refs.slider.setPosition(this.currentFrame);

            resolve();
          });
      });
    },

    done: function() {
      this.currentFrame = 0;
      this.isPlaying = false;

      let playButton = document.getElementById("play");
      let pauseButton = document.getElementById("pause");
      playButton.disabled = false;
      playButton.style.display = "block";
      pauseButton.disabled = true;
      pauseButton.style.display = "none";
    }
  }
};
</script>