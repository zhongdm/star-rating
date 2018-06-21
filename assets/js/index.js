$(function(){
  // 保存 mouseover执行前的active数量
  var globalVal = {
    curObj: '', // 第一种方案使用
    curObj2: ''
  }

  /* 第一种实现方案*/
  $(".rating li").on('mouseover', function(){
    executeClass(this)
  })

  $(".rating li").on('mouseout', function(){
    // 取消mouseover添加的样式
    var selectedIndex = globalVal.curObj
    // bug 注意： 0 == '' => true
    if(selectedIndex !== '') {
        var nodeList = $(this).parent()[0].children
        Array.prototype.forEach.call(nodeList, function(node,i){
          i > selectedIndex 
            ? $(node).removeClass('active')
            : $(node).addClass('active')
        })
    }
    else {
      // 没有做任何评价，清空样式
      $(this).parent().find('li').removeClass('active')
    }
  })

  $(".rating li").on('click', function(){
    globalVal.curObj = $(this).index()
    executeClass(this)
  })

  /* 评价的星星状态的变换 */
  function executeClass(obj) {
    $(obj).prevAll().addClass('active')
    $(obj).nextAll().removeClass('active')
    $(obj).addClass('active')
  }

  /* 第二种实现方案*/
  // canvas
  var canvas = document.getElementById('canvas');
  var cxt = canvas.getContext("2d");

  var starObj = {
      rx: 10, // 圆心x坐标
      ry: 20, // 圆心y坐标
      r1: 10, // 外圆半径
      r2: 5 // 内圆半径
  }

  var arrForPoint = drawMultiStar(cxt, starObj.r1 * 2 + 4, 5, -1)
  
  // 鼠标move事件
  $(canvas).on('mousemove', function(event) {
    starSelected(event)
  })

  $(canvas).on('click', function(event) {
    globalVal.curObj = starSelected(event)
  })
  $(canvas).on('mouseout', function(event) {
    if(globalVal.curObj !== '') {
      drawMultiStar(cxt, starObj.r1 * 2 + 4, 5, globalVal.curObj)
    }
    else {
      drawMultiStar(cxt, starObj.r1 * 2 + 4, 5, -1)
    }
  })
  
  function starSelected(event, curIndex){
    var s = document.getElementById('canvas'),
        offWidth = s.offsetLeft,
        offHeight = s.offsetTop

    var point = {
      x: event.pageX - offWidth,
      y: event.pageY - offHeight     
    }
    for(var i= 0; i < arrForPoint.length; i++) {
      var circleX = starObj.rx + (starObj.r1 * 2 + 4) * i,
          baseMinX = circleX - starObj.r1,
          baseMinY = starObj.ry - starObj.r1,
          baseMaxX = circleX + starObj.r1,
          baseMaxY = starObj.ry + starObj.r1

      if(point.x > baseMinX && point.x < baseMaxX 
        && point.y > baseMinY && point.y < baseMaxY ) {
          drawMultiStar(cxt, starObj.r1 * 2 + 4, 5, i)
        return i
        // break;
      }
    }
  }
  /**
    * 绘制五角星
    * @param cxt：canvas上下文
    * @param dir：绘制的方向
   */
  function drawStar(cxt, offsetX = 0, offsetY = 0) {
    var pointArr = []
    var circleObj = {
      rx: starObj.rx + offsetX, // 圆心x坐标
      ry: starObj.ry + offsetY, // 圆心y坐标
      r1: starObj.r1, // 外圆半径
      r2: starObj.r2 // 内圆半径
    }
    cxt.beginPath()
    cxt.moveTo(circleObj.rx + circleObj.r1* Math.cos(-90 * Math.PI / 180), 
      circleObj.ry + circleObj.r1 * Math.sin(-90 * Math.PI / 180)
    )
    pointArr.push({x: circleObj.rx + circleObj.r1* Math.cos(-90 * Math.PI / 180),
                  y: circleObj.ry + circleObj.r1 * Math.sin(-90 * Math.PI / 180)})
    for(var i = 1; i < 10; i++) {
      var angle = (-90 + 36 * i) * Math.PI / 180
      var r = i % 2 == 0 ? circleObj.r1 : circleObj.r2
      cxt.lineTo(circleObj.rx + r* Math.cos(angle), circleObj.ry + r * Math.sin(angle))
      pointArr.push({x: circleObj.rx + r* Math.cos(angle),
        y: circleObj.ry + r * Math.sin(angle)})
    }
    cxt.closePath()
    cxt.strokeStyle = "blue"
    cxt.stroke()
    
    return pointArr
  }

  /**
    * 绘制一连串的五角星
    * @param cxt：canvas上下文
    * @param dir：绘制的方向，默认true--水平方向， false-- 垂直方向
   */
  function drawMultiStar(cxt, offset , nums, curNum, dir = true) {
    var cx = dir ? offset : 0,
        cy = dir ? 0 : offset,
        rtnPointArr = []
    for(var i = 0; i < nums; i++) {
      var arr = drawStar(cxt, cx * i, cy * i)
      if(curNum >= i) {
        cxt.fillStyle = "yellow"
        cxt.fill()
      }
      else {
        cxt.fillStyle = "#fff"
        cxt.fill()
        // cxt.strokeStyle = "yellow"
        cxt.stroke()
       
      }
      rtnPointArr.push(arr)
    }
    return rtnPointArr
      
  }

  /**
    * 射线法判断点是否在多边形内部
   */
  function rayCasting(point, poly) {
    var _px = point.x,
        _py = point.y,
        flag = false

    for(var i = 0, l=poly.length, j = l-1; i <l; j = i, i++ ) {
      var _sx = poly[i].x,
          _sy = poly[i].y,
          _ex = poly[j].x,
          _ey = poly[j].y

      // 点和顶点重合
      if( _sx == _px && _sy == _py) {
        return 'on'
      }

       // 判断线段两端点是否在射线两侧
      if((_sy < _py && _ey >= _py) || (_sy >= _py && _ey < _py)) {
        // 线段上与射线 Y 坐标相同的点的 X 坐标
        var x = _sx + (_py - _sy) * (_ex - _sx) / (_ey - _sy)

        // 点在多边形的边上
        if(x === _px) {
          return 'on'
        }

        // 射线穿过多边形的边界
        if(x > _px) {
          flag = !flag
        }
      }
    }

    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return flag ? 'in' : 'out' 
    }
  // }
})