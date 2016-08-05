/**
 * @author forthtemple
 * Openworld
 *
 *  Functions to make it easier to use threejs in an open world application
 
    Functions to convert between world and local space
	
	A controller that works with a keyboard, touchscreen and mouse
 **/
 var OPENWORLD	= OPENWORLD 		|| {};

///////// 
// convert between local and world coordinates where up down is z. X Y is the surface
OPENWORLD.Space	= function(mesh)
{
	this._mesh=mesh;
	this._math=new OPENWORLD.Math();
	
	this._lerpobjects=[];

	// Get all meshes with the word surface in them for surface intersection
	this._surface= mesh.clone();
	var obj, i;
	for ( i = this._surface.children.length - 1; i >= 0 ; i -- ) {
			obj = this._surface.children[ i ];
			if ( obj.name.indexOf("surface")==-1) 
				this._surface.remove(obj);
	}						
	
	// Get all meshes with the word wall in them for wall intersection
	this._walls=mesh.clone();
	for ( i = this._walls.children.length - 1; i >= 0 ; i -- ) {
			obj = this._walls.children[ i ];
			if ( obj.name.indexOf("wall")==-1) 
				this._walls.remove(obj);
	}	
	
	this._raycaster = new THREE.Raycaster();

	// local coords to world coords
    this.localToWorld =  function(x,y,z) { 
		return new THREE.Vector3(x,-z,y); 
	}	
	
	// get world coords of an object
	this.localToWorldObj = function(object) { 
		return  this.localToWorld(object.position.x,object.position.y,object.position.z);//new THREE.Vector3(y,z,-x); 
	}
	
	// convert world coords to local cords
    this.worldToLocal =  function(x,y,z) { 
		return new THREE.Vector3(x,z,-y); 
	}

	// detect an intersection of a point with surface meshes looking down
	this.localIntersectSurface = function(localx,localy,localz)
	{
		if (typeof this._surface != "undefined"&&typeof this._surface.children != "undefined"&&typeof this._walls != "undefined"&&typeof this._walls.children != "undefined") {
			this._raycaster.set( new THREE.Vector3(localx,camera.position.y,localz), new THREE.Vector3( 0, -1, 0 ));
			// calculate objects intersecting the picking ray
			var intersects = this._raycaster.intersectObjects( this._surface.children);
			if (intersects.length>0) {
				return intersects[0].point.y;
			}

		} 
	
		return 0;//-Infinity;	
	}
	
	// world coords of z that intersects with surface with world coords x and y
	this.worldIntersectSurface = function(x,y)
	{
		var localx=x;		
		var localz=-y;
		return this.localIntersectSurface(localx, camera.position.y, localz);
	}
	
	// local coords of world coords intersection with surface looking down
    this.worldToLocalSurface =  function(x,y,z) { 
		var localx=x;
		var localy=this.worldIntersectSurface(x,y);
		var localz=-y;
		return new THREE.Vector3(localx,localy+z,localz); 
	}
	
	// set object to have world coords x,y,z where z is relative to the surface intersection
	this.worldToLocalSurfaceObj = function(object, x,y,z) { 
		// if being lerped somewhere else then remove it from the lerp
		var ind=this._lerpobjects.indexOf(object);
		if (ind>=0)
			this._lerpobjects.splice(ind,1);
		var position= this.worldToLocalSurface(x,y,z); 
		object.position.set(position.x, position.y, position.z);
	}
	
	// move object to x,y,z taking time seconds - lerp to the position
	this.worldToLocalSurfaceObjLerp = function(object, x,y,z, time) { 
		var position= this.worldToLocalSurface(x,y,z); 
		//object.position.set(position.x, position.y, position.z);
		object._lerpfromtime=system.currentMilliseconds();
		object._lerptotime=time;
		object._lerpinitialpos=object.position.clone();
		object._lerpfinalpos=position;
		if (this._lerpobjects.indexOf(object)<0)
			this._lerpobjects.push(object);
	}

		//  set to have world coords x,y,z but not relative to the surface
	this.worldToLocalObj = function(object, x,y,z) { 
		var position= this.worldToLocal(x,y,z); 
		object.position.set(position.x, position.y, position.z);
	}
	
	// turn an object where 0 is facing north, 90 east in world turn angle 
	this.objTurn = function(object, angle)
	{
		object.rotation.y=(-angle-180)*Math.PI/180;
	}

	// The angle the object is facing - 0 is north
	this.getObjTurn = function(object)
	{
		return -180*object.rotation.y/Math.PI;
	}

	// Angle from object1 to object2
	this.getAngleBetweensObjs = function(object1,object2)
	{
		var pos1=this.localToWorldObj(object1);
		var pos2=this.localToWorldObj(object2);
		return this._math.getAngleBetweenPoints(pos1,pos2);
		//return 180-180*object.rotation.y/Math.PI;
	}
	
	// How far between object1 and object2
	this.getDistanceBetweenObjs= function(object1,object2)
	{
		var pos1=this.localToWorldObj(object1);
		var pos2=this.localToWorldObj(object2);
		return Math.sqrt((pos1.x-pos2.x)*(pos1.x-pos2.x)+(pos1.y-pos2.y)*(pos1.y-pos2.y)+(pos1.z-pos2.z)*(pos1.z-pos2.z));
		//return 180-180*object.rotation.y/Math.PI;
	}
	
	// Move object forward movement
	this.objForward = function(object, moveamt)
	{
		object.translateZ(moveamt);
	}
	
	// z is above surface
	this.objForwardSurface = function(object, moveamt, z)
	{
		object.translateZ(moveamt);
		var localy= this.localIntersectSurface(object.position.x,camera.position.y,object.position.z);
		object.position.y=localy+z;
	}
	
	// move an object left or rigth relative to direction facing
	this.objLeftRight = function(object, moveamt)
	{
		object.translateX(moveamt);
	}
	
	// z is above surface
	this.objLeftRightSurface = function(object, moveamt, z)
	{
		object.translateX(moveamt);
		var localy= this.localIntersectSurface(object.position.x,999,object.position.z);
		object.position.y=localy+z;
	}	

	// z is above surface
	this.objUpSurface = function(object,  z)
	{
		var localy= this.localIntersectSurface(object.position.x,999,object.position.z);
		
		object.position.y=localy+z;
	}
	
	// intersection with closest wall. Prevlocal specifies the previous location so know what direction the object is heading
	this.wallIntersectDistance = function(localx, localy, localz, prevlocalx, prevlocaly, prevlocalz)
	{
		if (typeof this._surface != "undefined"&&typeof this._surface.children != "undefined"&&typeof this._walls != "undefined"&&typeof this._walls.children != "undefined") {
			var posVector=new THREE.Vector3(localx,localy,localz);
			var dirVector=new THREE.Vector3(localx-prevlocalx,localy-prevlocaly, localz-prevlocalz);
			this._raycaster.set( posVector, dirVector);
			intersects = this._raycaster.intersectObjects( this._walls.children);
			if (intersects.length>0) 
				return intersects[ 0].distance;
			
		}
		return -1;
								
	}


}

//////
OPENWORLD.System = function()
{
	// detect if using a mobile phone
	this.detectMobile= function() { 
		 if( navigator.userAgent.match(/Android/i)
		 || navigator.userAgent.match(/webOS/i)
		 || navigator.userAgent.match(/iPhone/i)
		 || navigator.userAgent.match(/iPad/i)
		 || navigator.userAgent.match(/iPod/i)
		 || navigator.userAgent.match(/BlackBerry/i)
		 || navigator.userAgent.match(/Windows Phone/i)
		 ){
			return true;
		  }
		 else {
			return false;
		  }
	}
	
	// epoch milliseconds elapsed
	this.currentMilliseconds= function() {	
		  var d = new Date();
		  return d.getTime(); 
	}							
}

///////
// functions for sound
OPENWORLD.Sound = function()
{
	
	// fade soundfrom to zero in fadetime seconds and then play soundto
	this.playFade= function(soundfrom, soundto, fadetime) {
		this._soundfrom=soundfrom;
		this._soundto=soundto;
		soundfrom.fadestarttick=system.currentMilliseconds();
		soundfrom.fadetime=fadetime;
		soundfrom.startvolume=soundfrom.getVolume();
	}
	
	this.update = function() {
		if (this._soundfrom) {
			var fct=1-(system.currentMilliseconds()-this._soundfrom.fadestarttick)/(this._soundfrom.fadetime*1000);
			if (fct<=0) {
				if (this._soundfrom.isPlaying)
					this._soundfrom.stop();
				this._soundto.play();
				this._soundfrom=null;
			} else {
				this._soundfrom.setVolume(this._soundfrom.startvolume*fct);
			}
		}
	}
}

///////
// functions for math
OPENWORLD.Math = function()
{
	// difference between angle1 and angle2
	this.angleDifference = function(angle1,angle2)
	{
	    diff=angle1-angle2;
		while (diff>180||diff<-180) {
			if (diff>180)//Math.PI)
				diff=diff-360;//(float)(2*Math.PI); // 340-360 is -20
			if (diff<-180)//Math.PI)
				diff=diff+360;//(float)(2*Math.PI); // -340+360 is 20
		}
		return diff;
	}
	
	// angle between two vectors
    this.getAngleBetweenPoints = function(v, v2)
    {
        var DeltaX, DeltaY;
        var ret;

        DeltaX = v2.x - v.x;
        DeltaY = -(v2.y - v.y);

        if (DeltaX < 0)
          ret= Math.atan(DeltaY / DeltaX) + Math.PI;
        else if (DeltaX > 0)
          ret =Math.atan(DeltaY / DeltaX);
        else {
          if (DeltaY < 0)
            ret = -Math.PI/ 2;
          else if (DeltaY > 0)
            ret = Math.PI / 2;
          else
            ret = 0.0;
        }
        if (ret<-1000||ret>1000)
          ret=0.0;
        else {
          ret=ret+Math.PI/2 ;
          while (ret < 0)
            ret+= 2 * Math.PI;
          while (ret >=2 * Math.PI)
            ret-= 2 * Math.PI;

          ret *=  180 / Math.PI;
         // ret=Math.toDegrees((double)ret);
        }
        return ret;
    }
    
    this.vectorDistance= function (v,v2)
    {
    	var deltaX=v.x-v2.x;
		var deltaY=v.y-v2.y;
		return  Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
    }
}

//var preventdefault=false;
/////////
// This controller combines a virtual joystick for smartphones, keyboard and mouse controls into one. 
// This code is based upon Jerome Etienne virtual joystick and keyboard code
var VirtualJoystick	= function(opts, camera, space)
{
	opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick();
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._stationaryBase	= opts.stationaryBase || false;
	this._baseX		= this._stickX = opts.baseX || 0
	this._baseY		= this._stickY = opts.baseY || 0
	this._limitStickTravel	= opts.limitStickTravel || false
	this._stickRadius	= opts.stickRadius !== undefined ? opts.stickRadius : 100
	this._useCssTransform	= opts.useCssTransform !== undefined ? opts.useCssTransform : false

	this._container.style.position	= "relative"

	this._container.appendChild(this._baseEl)
	this._baseEl.style.position	= "absolute"
	this._baseEl.style.display	= "none"
	this._container.appendChild(this._stickEl)
	this._stickEl.style.position	= "absolute"
	this._stickEl.style.display	= "none"

	this._pressed	= false;
	this._touchIdx	= null;
	
	if(this._stationaryBase === true){
		this._baseEl.style.display	= "";
		this._baseEl.style.left		= (this._baseX - this._baseEl.width /2)+"px";
		this._baseEl.style.top		= (this._baseY - this._baseEl.height/2)+"px";
	}
    
	this._transform	= this._useCssTransform ? this._getTransformProperty() : false;
	this._has3d	= this._check3D();
	
	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._$onMouseOut	= __bind(this._onMouseOut	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	//	this._container.addEventListener( 'mouseout'	, this._$onMouseOut	, false );
	}
	
	this.keyboard= new VirtualJoystick.KeyboardState();
	//this.touchscreen= new VirtualJoystick.Touchscreen();

	this._camera=camera;
	this._space=space;
	
	this._system=new OPENWORLD.System();
	this._ismobile=this._system.detectMobile();	
	
	this._active=true;
}





VirtualJoystick.prototype.destroy	= function()
{
	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);

	this._container.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.removeEventListener( 'touchend'		, this._$onTouchEnd	, false );
	this._container.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._container.removeEventListener( 'mouseup'		, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
	
	// Keyboard---
	this.domElement.removeEventListener("keydown", this._onKeyDown, false);
	this.domElement.removeEventListener("keyup", this._onKeyUp, false);	
}


/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
VirtualJoystick.touchScreenAvailable	= function()
{
	return 'createTouch' in document ? true : false;
}

/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
;(function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent		= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice(); 
		for(var i = 0; i < tmpArray.length; i++){
			var result	= tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
			if( result !== undefined )	return result;
		}
		return undefined
	};
})(VirtualJoystick.prototype);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX	= function(){ return this._stickX - this._baseX;	}
VirtualJoystick.prototype.deltaY	= function(){ return this._stickY - this._baseY;	}

VirtualJoystick.prototype.up	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY >= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
}
VirtualJoystick.prototype.down	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY <= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;	
}
VirtualJoystick.prototype.right	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX <= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;	
}
VirtualJoystick.prototype.left	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX >= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;	
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false; 
	this._stickEl.style.display	= "none";
	
	if(this._stationaryBase == false){	
		this._baseEl.style.display	= "none";
	
		this._baseX	= this._baseY	= 0;
		this._stickX	= this._stickY	= 0;
	}
}

VirtualJoystick.prototype._onDown	= function(x, y)
{

	this._pressed	= true; 
	if(this._stationaryBase == false){
		this._baseX	= x;
		this._baseY	= y;
		this._baseEl.style.display	= "";
		this._move(this._baseEl.style, (this._baseX - this._baseEl.width /2), (this._baseY - this._baseEl.height/2));
	}
	this._active=true;
	if(this._limitStickTravel === true){
		var deltaX=x - this._baseX;
		var deltaY=y - this._baseY;
		var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
		if(stickDistance > this._stickRadius){
			this._active=false;
			return;
		}
	}
	
	this._stickX	= x;
	this._stickY	= y;
	
	if(this._limitStickTravel === true){
		var deltaX	= this.deltaX();
		var deltaY	= this.deltaY();
		var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
		if(stickDistance > this._stickRadius){
			var stickNormalizedX = deltaX / stickDistance;
			var stickNormalizedY = deltaY / stickDistance;
			
			this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
			this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
		} 	
	}
	
	this._stickEl.style.display	= "";
	this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));	
}

VirtualJoystick.prototype._onMove	= function(x, y)
{

	if( this._pressed === true ){
		this._stickX	= x;
		this._stickY	= y;
		
		if(this._limitStickTravel === true){
			var deltaX	= this.deltaX();
			var deltaY	= this.deltaY();
			var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
			if(stickDistance > this._stickRadius){
				var stickNormalizedX = deltaX / stickDistance;
				var stickNormalizedY = deltaY / stickDistance;
			
				this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
				this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
				//this.touchscreen.onDocumentMouseMove();
			} 		
		}
		
        this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));	
	}	
}


//////////////////////////////////////////////////////////////////////////////////
//		bind touch events (and mouse events for debug)			//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onMouseOut	= function(event)
{	
	if (this._isOutside(-1,-1)) {
		this._container.removeEventListener( 'mouseout'	, this._$onMouseOut	, false );
		this._container.removeEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	} //else
		return this._onUp();
}

VirtualJoystick.prototype._onMouseUp	= function(event)
{
	return this._onUp();
}

VirtualJoystick.prototype._onMouseDown	= function(event)
{
	if (this_active) {//preventdefault)
		event.preventDefault();
		//alert('here');
	}
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onDown(x, y);
}

VirtualJoystick.prototype._onMouseMove	= function(event)
{
	var x	= event.clientX;
	var y	= event.clientY;
	
	return this._onMove(x, y);
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onTouchStart	= function(event)
{
	if (!this_active)
		return;
	
		// if there is already a touch inprogress do nothing
		if( this._touchIdx !== null )	return;

		// notify event for validation
		var isValid	= this.dispatchEvent('touchStartValidation', event);
		if( isValid === false )	return;
		
		// dispatch touchStart
		this.dispatchEvent('touchStart', event);

	   // if (this._active) {//preventdefault)
		   event.preventDefault();
		   //alert('ere');
		//} //else
		//alert('nnn');
		


		// get the first who changed
		var touch	= event.changedTouches[0];
		// set the touchIdx of this joystick
		this._touchIdx	= touch.identifier;

		// forward the action
		var x		= touch.pageX;
		var y		= touch.pageY;
		return this._onDown(x, y);
	
}

VirtualJoystick.prototype._onTouchEnd	= function(event)
{


	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// dispatch touchEnd
	this.dispatchEvent('touchEnd', event);

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
	// if touch event isnt found, 
	if( i === touchList.length)	return;

	// reset touchIdx - mark it as no-touch-in-progress
	this._touchIdx	= null;

//??????
// no preventDefault to get click event on ios
event.preventDefault();

	return this._onUp()
}

VirtualJoystick.prototype._onTouchMove	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++ );
	// if touch event with the proper identifier isnt found, do nothing
	if( i === touchList.length)	return;
	var touch	= touchList[i];

	if (this_active)//preventdefault)
    	event.preventDefault();

	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onMove(x, y)
}



//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

/**
 * build the canvas for joystick base
 */
VirtualJoystick.prototype._buildJoystickBase	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 126;
	canvas.height	= 126;
	
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle = this._strokeStyle; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();	

	ctx.beginPath(); 
	ctx.strokeStyle	= this._strokeStyle; 
	ctx.lineWidth	= 2; 
	ctx.arc( canvas.width/2, canvas.width/2, 60, 0, Math.PI*2, true); 
	ctx.stroke();
	
	return canvas;
}

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle	= this._strokeStyle; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();
	return canvas;
}

//////////////////////////////////////////////////////////////////////////////////
//		move using translate3d method with fallback to translate > 'top' and 'left'		
//      modified from https://github.com/component/translate and dependents
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._move = function(style, x, y)
{
	if (this._transform) {
		if (this._has3d) {
			style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
		} else {
			style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
		}
	} else {
		style.left = x + 'px';
		style.top = y + 'px';
	}
}

VirtualJoystick.prototype._getTransformProperty = function() 
{
	var styles = [
		'webkitTransform',
		'MozTransform',
		'msTransform',
		'OTransform',
		'transform'
	];

	var el = document.createElement('p');
	var style;

	for (var i = 0; i < styles.length; i++) {
		style = styles[i];
		if (null != el.style[style]) {
			return style;
		}
	}         
}
  
VirtualJoystick.prototype._check3D = function() 
{        
	var prop = this._getTransformProperty();
	// IE8<= doesn't have `getComputedStyle`
	if (!prop || !window.getComputedStyle) return module.exports = false;

	var map = {
		webkitTransform: '-webkit-transform',
		OTransform: '-o-transform',
		msTransform: '-ms-transform',
		MozTransform: '-moz-transform',
		transform: 'transform'
	};

	// from: https://gist.github.com/lorenzopolidori/3794226
	var el = document.createElement('div');
	el.style[prop] = 'translate3d(1px,1px,1px)';
	document.body.insertBefore(el, null);
	var val = getComputedStyle(el).getPropertyValue(map[prop]);
	document.body.removeChild(el);
	var exports = null != val && val.length && 'none' != val;
	return exports;
}





/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
*/
VirtualJoystick.KeyboardState	= function(domElement)
{
	this.domElement= domElement	|| document;
	// to store the current state
	this.keyCodes	= {};
	this.modifiers	= {};
	
	// create callback to bind/unbind keyboard events
	var _this	= this;
	this._onKeyDown	= function(event){ _this._onKeyChange(event)	}
	this._onKeyUp	= function(event){ _this._onKeyChange(event)	}

	// bind keyEvents
	this.domElement.addEventListener("keydown", this._onKeyDown, false);
	this.domElement.addEventListener("keyup", this._onKeyUp, false);
	
	this_active=true;
			
}



// Keyboard---
VirtualJoystick.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
VirtualJoystick.KeyboardState.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9,
	'escape'	: 27
};

/**
 * to process the keyboard dom event
*/
VirtualJoystick.KeyboardState.prototype._onKeyChange	= function(event)
{
	// log to debug
	//console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

	// update this.keyCodes
	var keyCode		= event.keyCode
	var pressed		= event.type === 'keydown' ? true : false
	this.keyCodes[keyCode]	= pressed
	// update this.modifiers
	this.modifiers['shift']	= event.shiftKey
	this.modifiers['ctrl']	= event.ctrlKey
	this.modifiers['alt']	= event.altKey
	this.modifiers['meta']	= event.metaKey
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
*/
VirtualJoystick.KeyboardState.prototype.pressed	= function(keyDesc){
	var keys	= keyDesc.split("+");
	for(var i = 0; i < keys.length; i++){
		var key		= keys[i]
		var pressed	= false
		if( VirtualJoystick.KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
			pressed	= this.modifiers[key];
		}else if( Object.keys(VirtualJoystick.KeyboardState.ALIAS).indexOf( key ) != -1 ){
			pressed	= this.keyCodes[ VirtualJoystick.KeyboardState.ALIAS[key] ];
		}else {
			pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
		}
		if( !pressed)	return false;
	};
	return true;
}

/**
 * return true if an event match a keyDesc
 * @param  {KeyboardEvent} event   keyboard event
 * @param  {String} keyDesc string description of the key
 * @return {Boolean}         true if the event match keyDesc, false otherwise
 */
VirtualJoystick.KeyboardState.prototype.eventMatches = function(event, keyDesc) {
	var aliases	= VirtualJoystick.KeyboardState.ALIAS
	var aliasKeys	= Object.keys(aliases)
	var keys	= keyDesc.split("+")
	// log to debug
	// console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
	for(var i = 0; i < keys.length; i++){
		var key		= keys[i];
		var pressed	= false;
		if( key === 'shift' ){
			pressed	= (event.shiftKey	? true : false)
		}else if( key === 'ctrl' ){
			pressed	= (event.ctrlKey	? true : false)
		}else if( key === 'alt' ){
			pressed	= (event.altKey		? true : false)
		}else if( key === 'meta' ){
			pressed	= (event.metaKey	? true : false)
		}else if( aliasKeys.indexOf( key ) !== -1 ){
			pressed	= (event.keyCode === aliases[key] ? true : false);
		}else if( event.keyCode === key.toUpperCase().charCodeAt(0) ){
			pressed	= true;
		}
		if( !pressed )	return false;
	}
	return true;
}


// Call this function in render so that updates camera position based upon mouse movements, joystick movements
VirtualJoystick.prototype.update = function() 
{        

	if (!this._active&& !this.keyboard.pressed("W")&& !this.keyboard.pressed("S")&& !this.keyboard.pressed("up")&& !this.keyboard.pressed("down")){//pressed) {
		var rotamt;
		if (this._ismobile)
			rotamt=0.15;
		else
			rotamt=1.2;
		this._camera.rotateY(targetRotationX*frameTime*rotamt);

		this._camera.rotateX(-targetRotationY*frameTime*rotamt);
		this._camera.up = new THREE.Vector3(0,1,0);

	} else 
	   this._camera.rotation.x=0;
	this._camera.rotation.z=0;

	targetRotationX=0;
	targetRotationY=0;

	var moveamt;
	if (this._ismobile)
		moveamt=500/1000;
	else
		moveamt=1000/1000;
	var rotamt;
	if (this._ismobile)
		rotamt=300;
	else
		rotamt=300;
		
	var joystickturn=false;
	
	if (this_active) {
		if( this.keyboard.pressed("D")|| this.keyboard.pressed("right") ){
				if (joystickturn)
					this._camera.rotateY(frameTime * rotamt* Math.PI / 180);
				else
					this._space.objLeftRightSurface(this._camera, moveamt*frameTime, cameraoffset);
					//camera.translateX(moveamt * frameTime );
		}
		if( this.keyboard.pressed("A")|| this.keyboard.pressed("left") ){
				if (joystickturn)
					this._camera.rotateY(-frameTime * rotamt* Math.PI / 180);
				else
					this._space.objLeftRightSurface(this._camera, -moveamt*frameTime, cameraoffset);					
					//camera.translateX( - moveamt * frameTime );
		}
		if( this.keyboard.pressed("W") || this.keyboard.pressed("up")){
			this._space.objForwardSurface(this._camera, -moveamt*frameTime, cameraoffset);					
			//camera.translateZ( - moveamt * frameTime );
		}
		if( this.keyboard.pressed("S")|| this.keyboard.pressed("down") ){
			this._space.objForwardSurface(this._camera, moveamt*frameTime, cameraoffset);					
			//camera.translateZ( moveamt * frameTime );
		}
    }
	if (this._active) {
		if( this.right() ){
			if (joystickturn)
				this._camera.rotateY(-frameTime * rotamt* Math.PI / 180);
			else
				this._space.objLeftRightSurface(this._camera, moveamt*frameTime, cameraoffset);					
		}
		if( this.left() ){
			if (joystickturn)
				this._camera.rotateY(frameTime * rotamt* Math.PI / 180);
			else					
				this._space.objLeftRightSurface(this._camera, -moveamt*frameTime, cameraoffset);					
		}
		if( this.up() ){
			//camera.position.z = camera.position.z -  amt * frameTime;
			this._space.objForwardSurface(this._camera, -moveamt*frameTime, cameraoffset);					

		}
		if( this.down() ){
			this._space.objForwardSurface(this._camera, moveamt*frameTime, cameraoffset);					

		}
	}

	for (i=space._lerpobjects.length-1; i>=0; i-- ) {
		var obj=space._lerpobjects[i];
		if (!obj) {
			space._lerpobjects.splice(i,1);
		} else {
			var lerp=(system.currentMilliseconds()-obj._lerpfromtime)/(obj._lerptotime*1000);
			//alert('iii'+i+' '+lerp);
			if (lerp>=1) {
				obj.position.set(obj._lerpfinalpos.x,obj._lerpfinalpos.y,obj._lerpfinalpos.z);
				//space._lerpobjects.remove(obj);
				//alert(space._lerpobjects.length+",mmm"+space._lerpobjects.indexOf(obj));
				var inddelete=space._lerpobjects.indexOf(obj);
				space._lerpobjects = space._lerpobjects.slice(inddelete, inddelete); 
				//alert(space._lerpobjects.length+",uummm");
			} else {
				obj.position.set(
					obj._lerpinitialpos.x+lerp*(obj._lerpfinalpos.x-obj._lerpinitialpos.x),
					obj._lerpinitialpos.y+lerp*(obj._lerpfinalpos.y-obj._lerpinitialpos.y),
					obj._lerpinitialpos.z+lerp*(obj._lerpfinalpos.z-obj._lerpinitialpos.z));

				/*$(".the-return").html(
							obj.position.x.toFixed(2)+' y'+obj.position.y.toFixed(2)+"z "+obj.position.z.toFixed(2)
						);*/
			}
		}

	}
	
}

//////
// cheat seems to work. Allows to mix listeners for joystick and touch on screen
function onDocumentMouseDown( event ) {

	if (this_active)//preventdefault)
	    event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	//mouseXOnMouseDown = event.clientX - windowHalfX;
	//targetRotationOnMouseDown = targetRotation;
	mouseX= event.clientX;
	mouseY= event.clientY;
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;	
}

function onDocumentMouseMove( event ) {


	//targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
	targetRotationX=mouseX-event.clientX;
	targetRotationY=event.clientY-mouseY;
	mouseX = event.clientX;// - windowHalfX;
	mouseY = event.clientY;// - windowHalfX;

}

function onDocumentMouseUp( event ) {
	//targetRotation=0;
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {
  //  targetRotation=0;
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length === 1 ) {

		if (this_active)//preventdefault)
             event.preventDefault();
		mouseX=event.touches[ 0 ].pageX;
		mouseY=event.touches[ 0 ].pageY;
		//mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		//targetRotationOnMouseDown = targetRotation;
	}
}

function onDocumentTouchMove( event ) {

	if ( event.touches.length === 1 ) {
		if (this_active)//preventdefault)
			event.preventDefault();

		//mouseX = event.touches[ 0 ].pageX;//- windowHalfX;
		targetRotationX =  mouseX-event.touches[ 0 ].pageX;//targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
		targetRotationY = event.touches[ 0 ].pageY- mouseY;//targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
		mouseX = event.touches[ 0 ].pageX;//- windowHalfX;
		mouseY = event.touches[ 0 ].pageY;//- windowHalfX;

	}
}
			
OPENWORLD.Touchscreen = function()
{
	//this._active=true;
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

		

}