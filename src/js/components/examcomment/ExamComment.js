/***************************************************
 * 时间: 16/5/21 21:48
 * 作者: zhongxia
 * 说明: 评论列表
 *
 ***************************************************/
window.ExamComment = (function () {
  function ExamComment(selector, config) {
    this.selector = selector;
    this.config = config;
    this.data = config.data;
    this.scale = config.scale;
    this.userid = config.userid;

    this.startRecordCallback = config.startRecordCallback;
    this.stopRecordCallback = config.stopRecordCallback;

    this.basePath = ""; //'../';  //评论图片的地址
    this.avatarBaseURL = ''; //基本头像地址

    //本地开发用
    if (location.href.indexOf('192') !== -1 || location.href.indexOf('localhost') !== -1) {
      this.avatarBaseURL = 'http://dev.catics.org' + this.avatarBaseURL
    }

    this.pageid = config.pageid || 1240;
    this.videoid = config.videoid || 1466;
    this.type = "0";

    this.config.isVertical = this.config.isVertical || true;
    this.click = IsPC() ? 'click' : 'tap';
    this.global = {
      ENUM: {
        TEXT: "0",
        IMG: "1",
        AUDIO: "2"
      },
      isUploadPage: false, // 当前是否显示  图片上传, 语音录制的页面, 是: 点击取消, 返回 创建 评论页面
    }
    this.render();

    this.audio = document.createElement('audio');
    document.body.appendChild(this.audio);

    //ImagesZoom.init({
    //  "elem": ".primary"
    //});Unsupported type 


    return this;

  }

  ExamComment.prototype = {
    /**
     * 渲染页面
     */
    render: function () {
      var html = this.config.isVertical ? this.renderContainer() : this.renderHContainer();

      $(this.selector).html(html);

      //设置 cmt-content 下的img 在移动端可以放大缩小
      ImagesZoom.init({
        "elem": '.cmt-content img'
      });


      this.initWebUploader();
      this.initVar();
      this.bindEvent();

      //不是微信浏览器, 不能上传语音功能
      if (!isWeiXin()) {
        $(this.selector).find('.cmt-audio').hide();
      }
    },
    /**
     * 初始化题干列表
     */
    renderContainer: function () {
      var html = '';
      html += '<div class="cmt-container">'
      html += '  <div class="cmt-top">'
      html += '    <span>评论</span>'
      html += '    <div class="cmt-top-img"></div>'
      html += '  </div>'
      html += this.renderCommentCreate()
      html += '  <div class="cmt-main">'
      html += '   <ul class="main-comment-list">'
      html += this.renderComments(this.data)
      html += '   </ul>'
      html += '  </div>'
      html += '</div>'
      return html;
    },
    /**
     * 初始化题干列表[ 横屏 ]
     */
    renderHContainer: function () {
      var html = '';

      return html;
    },

    /**
     * 生成评论列表
     * @param list 列表数据
     * @returns {string}
     */
    renderComments: function (list) {
      var html = '';
      for (var i = 0; i < list.length; i++) {
        var comment = list[i];
        comment.avatar = comment.avatar || "/edu/course/diandu/imgs/exam_comment/default.jpeg"
        comment.truename = comment.truename || "匿名用户"
        var isRemove = (comment.userid == this.userid);

        html += '<li data-id="' + comment.id + '" class="' + (isRemove ? 'cmt-list-remove' : '') + '">'
        html += '  <span class="u-img">'
        html += '    <img src="' + this.avatarBaseURL + comment.avatar + '" class="img">'
        html += '  </span>'
        html += '  <div class="detail">'
        html += '    <div class="cmt-name-wrap" >'
        html += '      <a class="cmt-name">' + comment.truename + '</a>'
        html += '      <div class="cmt-support">'
        html += '         <div class="cmt-setgood"></div>'
        html += '         <span class="cmt-goodcounts" style="float: right; margin-right:10px">' + comment.support + '</span>'
        html += '      </div>'
        html += '      <div class="cmt-btn-remove"></div>'
        html += '    </div>'
        html += '    <div class="cmt-title">'
        if (comment.location) {
          html += '      <span class="location">' + comment.location + '</span>'
        }
        html += '      <time class="time">' + $.timeago(comment.addtime) + '</time>'
        html += '    </div>'
        html += '    <div class="cmt-content">'
        html += this.renderCommentContent(comment)
        html += '    </div>'
        html += '  </div>'
        html += '</li>'
      }
      return html;
    },

    /**
     * 创建评论
     * @returns {string}
     */
    renderCommentCreate: function () {
      var html = '';
      html += '<div class="cmt-create" style="display: none">'
      html += '   <textarea style="width: 100%" rows="5"></textarea>'
      html += '   <div class="cmt-upload-div">'
      html += '     <div class="cmt-audio-div">'
      html += '       <div class="cmt-audio-div-img"></div>'
      html += '       <div class="cmt-audio-div-text"><div>点击后对着麦克风说话</div>限时60秒</div>'
      html += '       <div class="cmt-audio-div-text-record" style="display: none;">点击结束录音</div>'
      html += '       <div class="record-time" style="display: none;"></div>'
      html += '     </div>'
      html += '     <div class="cmt-image-div">点击上传照片</div>'
      html += '   </div>'
      html += '   <div class="cmt-upload-type">'
      html += '     <div data-id="uploadAudio" class="cmt-audio"></div>'
      html += '     <div data-id="uploadImg" class="cmt-image"></div>'
      html += '   </div>'
      html += '   <div class="cmt-create-btns">'
      html += '      <div class="cmt-cancle"></div>'
      html += '      <div class="cmt-submit"></div>'
      html += '   </div>'
      html += '</div>'
      return html;
    },
    /**
     * 渲染评论内容, 三种类型, 文字, 图片, 语音
     * @param content 可能是文字, 或者图片地址, audio 地址
     * @param type
     */
    renderCommentContent: function (comment) {
      var html = '';
      switch (comment.type) {
        case this.global.ENUM.TEXT:
          html = comment.content;
          break;
        case this.global.ENUM.IMG:
          html = '<img data-id="cmtImg" class="cmt-image" src="' + this.basePath + comment.attachment + '" alt="">'
          break;
        case this.global.ENUM.AUDIO:

          comment.content = comment.content || '0'
          comment.content = parseInt(comment.content)

          html += '<div class="cmt-comment-audio">'
          html += '  <div class="audio-size"><img style="display:none; height:0.2rem; width:0.2rem; margin:0.05rem 0 0 0.05rem;" src="./imgs/exam_comment/comment-audio-play.gif"/></div>'
          html += ' <div class="audio-length" data-audio="' + comment.attachment + '">' + comment.content + '\"</div>'
          html += '</div>'
          break;
      }
      return html;
    },
    /**
     * 初始化上传组件
     */
    initWebUploader: function () {
      var that = this;
      var url = "php/fileupload.php";
      this.uploader = WebUploader.create({
        server: url,
        pick: this.selector + " .cmt-image-div",
        resize: true,
        auto: true,
        threads: 1,
        duplicate: true,
        compress: {
          // 图片质量，只有type为`image/jpeg`的时候才有效。
          quality: 30,
          // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
          allowMagnify: false,
          // 是否允许裁剪。
          crop: false,
          // 是否保留头部meta信息。
          preserveHeaders: false,
          // 如果发现压缩后文件大小比原来还大，则使用原来图片
          // 此属性可能会影响图片自动纠正功能
          noCompressIfLarger: false,
          // 单位字节，如果图片大小小于此值，不会采用压缩。
          compressSize: 0
        },
        accept: {
          title: 'Images',
          extensions: 'gif,jpg,jpeg,bmp,png',
          mimeTypes: 'image/*'
        },
        fileSingleSizeLimit: 1024 * 1024 * 10 //最大 10M
      })

      /**
       * 上传成功
       */
      this.uploader.on('uploadSuccess', function (file, res) {
        Logger.log("file.size", file)
        var path = res._raw;

        that.attachment = path;

        that.$container.find('.webuploader-pick').addClass('cmt-hide');
        that.$div_uploadImage.css({
          backgroundImage: 'url(' + path + ')', //在 show.html 就不需要使用这个地址
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          backgroundPosition: 'center'
        })
      })
    },
    /**
     * 初始化变量
     */
    initVar: function () {
      this.$container = $(this.selector);
      this.$btn_createCmt = this.$container.find('.cmt-top-img');
      this.$div_cmtCreate = this.$container.find('.cmt-create');
      this.$textarea = this.$container.find('textarea');
      this.$div_upload = this.$container.find('.cmt-upload-div');
      this.$div_uploadAudio = this.$container.find('.cmt-audio-div');
      this.$div_uploadImage = this.$container.find('.cmt-image-div');
      this.$btn_setGood = this.$container.find('.cmt-setgood');
      this.$btn_setSupport = this.$container.find('.cmt-support');
      this.$btn_cancle = this.$container.find('.cmt-cancle');
      this.$btn_submit = this.$container.find('.cmt-submit');
      this.$btn_audio = this.$container.find('[data-id="uploadAudio"]');
      this.$btn_image = this.$container.find('[data-id="uploadImg"]');
      this.$btn_cmtImg = this.$container.find('[data-id="cmtImg"]');
      this.$playAudio = this.$container.find('.cmt-comment-audio');
      this.$audioText = this.$container.find('.cmt-audio-div-text'); //录音提示
      this.$audioTextRecord = this.$container.find('.cmt-audio-div-text-record'); //正在录音提示
      this.$recordTime = this.$container.find('.record-time'); //录音时长提示
      this.$btn_del = this.$container.find('.cmt-btn-remove') //删除评论
    },

    /**
     * 绑定事件
     */
    bindEvent: function () {
      var that = this;

      //创建评论
      that.$btn_createCmt.off().on(that.click, function () {
        if (that.$btn_createCmt.hasClass('cmt-top-img-on')) {
          that.$div_cmtCreate.hide()
          that.$btn_createCmt.removeClass('cmt-top-img-on')
        } else {
          that.$div_cmtCreate.show()
          that.$btn_createCmt.addClass('cmt-top-img-on')
        }
      })

      //获取焦点, 坐一个标识,让 resize 不重新生成页面
      this.$textarea.on('focus', function () {
        window.SHOWINPUT = true;
      })

      //失去焦点, 清空标识,让 resize 可以继续重新生成页面
      this.$textarea.on('blur', function () {
        setTimeout(function () {
          window.SHOWINPUT = false;
        }, 1000)
      })

      // 图片上传
      that.$btn_image.off().on(that.click, function () {
        that.type = "1";
        that.global.isUploadPage = true;
        that.$textarea.hide();
        that.$div_upload.show();
        that.$div_uploadAudio.hide();
        that.$div_uploadImage.show();
      })


      // 语音录制
      that.$btn_audio.off().on(that.click, function () {
        that.type = "2";
        that.global.isUploadPage = true;
        that.$textarea.hide();
        that.$div_upload.show();
        that.$div_uploadAudio.show();
        that.$div_uploadImage.hide();
      })

      //录音, 点击开始录音, 在点击结束录音
      that.$div_uploadAudio.off().on(that.click, function (event) {
        event.preventDefault();
        var _$audio_div = that.$div_uploadAudio.find('.cmt-audio-div-img');

        if (_$audio_div.hasClass('cmt-audio-div-img-on')) {
          // 停止录音
          that.stopRecord();
        } else {
          //开始录音
          _$audio_div.addClass('cmt-audio-div-img-on');
          that.startRecord();
        }
      })


      //播放录音
      that.$playAudio.off().on(that.click, function (e) {

        //关闭所有播放的GIF状态
        that.$container.find('.main-comment-list .cmt-comment-audio img').hide()
        that.$container.find('.main-comment-list .cmt-comment-audio .audio-size').css('width', '0.3rem');

        var $cTar = $(e.target);
        var path = $cTar.attr('data-audio');

        //录音播放结束停止播放效果
        $(that.audio).off().on('ended', function () {
          that.playing = false;
          that.audio.pause();
          that.playResLocalId = null;
          $cTar.parent().find('.audio-size').css('width', '0.3rem');
          $cTar.parent().find('img').hide();
        })

        if (!that.playing) {
          that.audio.src = path;
          that.audio.play();
          $("#status").html("播放录音...");
          that.playing = true; //标识正在播放
          $cTar.parent().find('img').show();
          $cTar.parent().find('.audio-size').css('width', 0);
        } else {
          that.audio.pause();
          that.playing = false;
          that.playResLocalId = null;
          $cTar.parent().find('.audio-size').css('width', '0.3rem');
          $cTar.parent().find('img').hide();
        }

        // if (!that.playing) {
        //   $('body').trigger('STOPBGAUDIO', true);
        //   //下载录音
        //   (typeof wx !== "undefined") && wx.downloadVoice({
        //     serverId: $cTar.attr('data-audio'),
        //     isShowProgressTips: 1,
        //     success: function(res) {
        //       that.playResLocalId = res.localId;
        //       //播放
        //       wx.playVoice({
        //         localId: res.localId,
        //         success: function(res) {
        //           $("#status").html("播放录音...");
        //           that.playing = true; //标识正在播放
        //           $cTar.parent().find('img').show();
        //           $cTar.parent().find('.audio-size').css('width', 0);
        //         }
        //       });

        //       //播放结束
        //       wx.onVoicePlayEnd({
        //         success: function(playEndRes) {
        //           Logger.log("onVoicePlayEnd")
        //           that.playing = false;
        //           that.playResLocalId = null;
        //           var localId = playEndRes.localId; // 返回音频的本地ID
        //           $cTar.parent().find('.audio-size').css('width', '0.3rem');
        //           $cTar.parent().find('img').hide();
        //           //$('body').trigger('STOPBGAUDIO', false)  //启动背景音乐
        //         }
        //       });
        //     }
        //   })
        // }
        // //停止播放
        // else {
        //   Logger.log("playResLocalId", that.playResLocalId)
        //   wx.stopVoice({
        //     localId: that.playResLocalId,
        //     success: function(stopRes) {
        //       Logger.log("stopVoice")
        //       that.playing = false;
        //       that.playResLocalId = null;
        //       $cTar.parent().find('.audio-size').css('width', '0.3rem');
        //       $cTar.parent().find('img').hide();
        //       //$('body').trigger('STOPBGAUDIO', false)   //启动背景音乐
        //     }
        //   });
        // }
      })

      // 取消
      that.$btn_cancle.off().on(that.click, function () {
        that.cancleCreateCmt()
      })

      //提交
      that.$btn_submit.off().on(that.click, function () {
        var data = {
          videoid: that.videoid,
          pageid: that.pageid,
          content: that.$textarea.val(),
          type: that.type,
          attachment: that.attachment
        }

        if (that.type === "2") data.content = that.videoTime;

        //如果评论内容, 或者附件列表为空,则不允许添加评论
        if (data.content || data.attachment) {
          Model.addComment(data, function (result) {
            that.cancleCreateCmt();
            that.reRender()
          })
        }
      })


      //点赞
      that.$btn_setSupport.off().on(that.click, function (e) {
        var $ctar = $(e.currentTarget);
        var _cmtId = $ctar.parent().parent().parent().attr('data-id');

        //发送点赞接口
        Model.support(_cmtId, function (result) {
          if (result) {
            var _$goddCount = $ctar.find('.cmt-goodcounts');
            _$goddCount.text(parseInt(_$goddCount.text()) + 1)
          }
        })
      })


      //删除评论
      that.$btn_del.off().on(that.click, function (e) {
        var $ctar = $(e.currentTarget);
        var $comment = $ctar.parent().parent().parent();
        var _cmtId = $comment.attr('data-id');

        //confirm 确定删除?
        var dia = $.dialog({
          content: '确定删除该条评论?',
          button: ["确认", "取消"]
        });

        dia.on("dialog:action", function (ev) {
          if (ev.index === 0) {
            //发送点赞接口
            Model.delComment(_cmtId, function (result) {
              if (result) {
                $comment.remove()
              }
            })
          }
        });
      })

    },

    /**
     * 开始录音
     */
    startRecord: function () {
      var that = this;
      var _$audio_div = that.$div_uploadAudio.find('.cmt-audio-div-img');
      _$audio_div.addClass('cmt-audio-div-img-on');

      that.$recordTime.hide()
      that.$audioText.hide();
      that.$audioTextRecord.show();

      Logger.log("按住开始录音....");

      if (!that._startRecordFlag) {
        typeof wx !== "undefined" && wx.startRecord({
          success: function (res) {
            Logger.log("res", res)
            if (res.errMsg == 'startRecord:ok') {
              Logger.log("正在开始录音....")
              that._startTime = new Date().getTime();
            }
          }
        });
      }

      //开始录音, 结束背景音乐
      that.startRecordCallback && that.startRecordCallback();
    },

    /**
     * 结束录音,并上传
     */
    stopRecord: function () {
      var that = this;
      var _$audio_div = that.$div_uploadAudio.find('.cmt-audio-div-img');
      _$audio_div.removeClass('cmt-audio-div-img-on');
      that.$audioText.show();
      that.$audioTextRecord.hide();
      Logger.log("放开结束录音....");
      that._startRecordFlag = false;
      typeof wx !== "undefined" && wx.stopRecord({

        success: function (res) {
          Logger.log("已经停止", window.resLocalId)
          that.videoTime = ((new Date().getTime() - that._startTime) / 1000).toFixed(2);
          that.$audioText.hide()
          that.$recordTime.text("录音结束,时长: " + that.videoTime + "秒").show();

          //上传录音
          wx.uploadVoice({
            localId: res.localId,
            isShowProgressTips: 1,
            success: function (resUpload) {
              //下载录音文件到服务器，转存起来
              Model.downloadRecordAudio(resUpload.serverId, function (result) {
                console.log(resUpload.serverId, result.path)
                that.attachment = result.path;
                // that.attachment = resUpload.serverId;
                that.stopRecordCallback && that.stopRecordCallback();
              })

            }
          });

        }
      });
    },
    /**
     * 隐藏评论
     */
    cancleCreateCmt: function () {

      this.type = "0"
      this.$textarea.val("");
      if (this.global.isUploadPage) {
        this.$div_upload.hide();
        this.$textarea.show();
        this.global.isUploadPage = false;
        this.$div_uploadAudio.find('.cmt-audio-div-img').removeClass('cmt-audio-div-img-on')
      } else {
        this.$div_cmtCreate.hide()
        this.$btn_createCmt.removeClass('cmt-top-img-on')
      }
    },
    /**
     * 重新渲染
     */
    reRender: function () {
      var that = this;
      Model.getComment(that.pageid, function (data) {
        that.data = data;
        that.render();
      })
    }
  }


  /**
   * 判断是否为PC端
   * @returns {boolean}
   * @constructor
   */
  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  /**
   * 是否为微信浏览器
   * @returns {boolean}
   */
  function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  }

  return ExamComment;
})
  ()