/*
 * 进度条组件[支持PC,移动端,使用 zepto]
 * */

// 构造函数
window.SlideBar = function SlideBar(data) {
  this.data = data;
  this.entireBar = data.entireBar || 'entire-bar';   //到当前刻度的进度条
  this.actionBlock = data.actionBlock || 'action-block';  //滑块
  this.scrollBar = data.scrollBar || 'scroll-bar'; //进度条

  this.callback = data.callback;
  this.clickCallback = data.clickCallback;
  this.barLength = data.barLength || 900;
  this.maxNumber = (data.maxNumber || 100) * 90 / 70;  //底图的比例,超过这个比例,则是关闭自动播放
  this.data = data;
  this.scale = data.barLength / 900; //缩放的比例
  this.value = data.value || 0;

  this.useScale();
  this.setValue(this.value)
  this.touchDrag();
  this.drag();

  //是否允许点击进度条跳转到指定进度
  if (data.allowClick) {
    this.allowClick()
  }
}

SlideBar.prototype = {
  /**
   * 鼠标按着拖动滑动条
   */
  drag: function () {
    var that = this;
    var actionBlock = document.getElementById(that.actionBlock);
    if (actionBlock) {
      actionBlock.onmousedown = function (evdown) {
        evdown = evdown || event;
        var target = evdown.currentTarget;
        var thisBlock = this;
        var disX = event.clientX - target.offsetLeft;

        document.onmousemove = function (evmove) {
          evmove = evmove || event;
          var moveX = evmove.clientX - disX;
          if (moveX < 0) moveX = 0;
          if (moveX > target.parentNode.offsetWidth - target.offsetWidth) moveX = target.parentNode.offsetWidth - target.offsetWidth;
          thisBlock.style.left = moveX + 'px';

          that.value = Math.round((target.offsetLeft) / (that.barLength - target.offsetWidth) * that.maxNumber);
          that.value = that.value === 0 ? 1 : that.value;
          that.callback && that.callback(that.value, that);
          return false;
        }

        document.onmouseup = function () {
          document.onmousemove = document.onmouseup = null;
        }
        return false;
      }
    }
  },
  touchDrag: function () {
    var that = this;
    var moveX, startX;
    $(document).on("touchstart", "#" + that.data.actionBlock, function (event) {
      if ($(event.currentTarget).attr('id') == that.actionBlock) {
        var touchPros = event.touches[0];
        startX = touchPros.clientX - event.currentTarget.offsetLeft;
      }
      return false;
    }).on("touchmove", "#" + that.actionBlock, function (event) {
      if ($(event.currentTarget).attr('id') == that.actionBlock) {
        var target = event.currentTarget;
        var touchPros = event.touches[0];

        moveX = touchPros.clientX - startX;

        if (moveX < 0) moveX = 0;
        if (moveX > target.parentNode.offsetWidth - target.offsetWidth) moveX = target.parentNode.offsetWidth - target.offsetWidth;
        $('#' + that.actionBlock).css('left', moveX)

        that.value = Math.round((target.offsetLeft) / (that.barLength - target.offsetWidth) * that.maxNumber);
        that.value = that.value === 0 ? 1 : that.value;

        that.callback && that.callback(that.value, that);
      }
    });
  },
  /**
   * 允许点击进度条，跳转到指定位置
   */
  allowClick: function () {
    var that = this;
    $('#' + that.scrollBar).on('click', function (e) {
      var $cTar = $(e.currentTarget)
      var $val = $('#' + that.actionBlock);
      if ($(e.target).attr('id') !== that.actionBlock) {
        var offsetX = e.offsetX;
        var left = offsetX - $val.width() / 2;
        if (left < 0) left = 0;
        $val.css('left', left);

        if (that.clickCallback) that.clickCallback(left / $cTar.width())
      }
    })
  },
  setValue: function (value) {
    var _leftVal = value > this.maxNumber ? this.maxNumber * 0.9 : value;
    var $block = $('#' + this.actionBlock);
    var _left = this.barLength / this.maxNumber * _leftVal;
    $block.css('left', _left);
    this.callback && this.callback(value);
  },

  getStyle: function (obj, attr) {
    return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
  },

  useScale: function () {
    var size = 100 * this.scale;
    var entireW = 900 * this.scale;
    var entireH = 46 * this.scale;
    var _fontSize = 50 * this.scale;

    var _top = -((size - entireH) / 2);
    $('#' + this.actionBlock).css({
      width: size,
      height: size,
      lineHeight: size + "px",
      top: _top,
      fontSize: _fontSize
    })

    $('#' + this.entireBar).css({
      width: entireW,
      height: entireH
    })

    $('#' + this.scrollBar).css({
      width: entireW,
      height: 100 * this.scale,
      top: 20 * this.scale
    })

  }
}

