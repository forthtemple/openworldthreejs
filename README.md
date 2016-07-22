# Open World for threejs
A minimalistic framework to make it easier creating an open world with threejs for both smartphones and desktops.
oo
To demonstrate the framework, a demo had be made for the Second Temple, the temple that was at the center of judaism before 77AD. It is where the dome of the rock currently stands on the temple mount in Jerusalem. In the demo you can explore the second temple. This framework also includes the original blender models for the temple and also the actors in the demo.

Live Demo http://www.secondtemple.org

![alt tag](http://secondtemple.org/screenshots/temple200.jpg)  ![alt tag](http://secondtemple.org/screenshots/templeiii200.jpg)

**Installation**

Unzip the distrubution and then double click index.html under /web/secondtemple

**Intro**

The framework revolves around a main world model that contains surfaces and walls that the framework detects to allow a user to walk around a model. The demo include a blender model for the second temple. It contains meshes with the word wall and surface in them to specify that a mesh is a surface or wall. The minimalistic framework is in the javascript file /web/secondtemple/openworldjs/openworld.js has function to detect collisions, giving world coords eg 5,4,0 means 5,4 in the xy plane and height zero off the surface

also turning 90 degrees simple

also has an all purpse controller with virtual joystick that works on a smartphone, also keyboard and mouse movement

everything else use threejs as standard


**Using blender models**

for non actors convert to obj so that can have multi texture
	-for main world
		-tend to use a lot of repeating textures
		-export selected for hidden
		-tempole.blend has hidden
		-have the name surface in the mesh name for surfaces
		-walls
		-blender have
	-also for mdoels in world that are non actors eg the ark
for actors export as json but only one texture
	-how add json exporter for blender
	-steps how to export

	

