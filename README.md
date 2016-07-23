# Open World for threejs
A minimalistic framework to make it easier creating an open world with threejs for both smartphones and desktops.

To demonstrate the framework, a demo had be made for the Second Temple, the temple that was at the center of judaism before 77AD. It is where the dome of the rock currently stands on the temple mount in Jerusalem. In the demo you can explore the Second Temple. This framework also includes the original blender models for the temple and the actors in the demo. The demo should work on smartphone browsers (tested on iPhone and iPad 9.3) and desktops.

Live Demo http://www.secondtemple.org

![alt tag](http://secondtemple.org/screenshots/temple200.jpg)  ![alt tag](http://secondtemple.org/screenshots/templeiii200.jpg)

**Installation**

Unzip the distrubution and then double click index.html under /web/secondtemple

**Intro**

The framework revolves around a main world model that contains surfaces and walls that the framework detects to allow a user to walk around a model. The demo includes a blender model for the second temple (/models/secondtemple/temple/temple.blend). The minimalistic framework is in the javascript file /web/secondtemple/openworldjs/openworld.js and has functions that make it possible to work with world coordinates and directions instead of local coordinates and rotations. For example the coordinates 5,4,0 means 5,4 in the xy plane and height zero off the surface of the model. Also direction can be specified with 90 degrees being east, 180 being south.

The openworld framework also includes an all purpose controller with virtual joystick that works on a smartphone. It also works with a keyboard and mouse.

Beyond the framework providing world coordinates and the controller, everything else such as loading models, sound, sky etc uses the standard threejs libraries.

**Using blender models**

All the models in the demos are created using Blender. There are included in the repository. In the demo, models are exported as wavefront 'obj' models since they allow for multiple texturing. For actors they are exported from Blender as json models since they include animations which json allows for but obj does not.

If you open /models/secondtemple/temple/temple.blend notice the multiple meshes. Notice that some have the word wall and some surface in them.

![alt tag](http://secondtemple.org/screenshots/wallsurface.jpg) 

A surface mesh will be intersected by the open world framework to determine the ground. Walls are also detected to stop players walking through walls. Also notice the units of distance in the blender model are around about 1 meter. Also Z is up. Also some meshes are hidden in order to reduce the size. To export the temple.blend model to obj, select all the meshes you wish to export (will exclude the hidden ones) and then export the obj and then click on 'selection only' to only export the selected meshes.

![alt tag](http://secondtemple.org/screenshots/exportobj.jpg) 

To export an actor like a priest (/models/secondtemple/priest/priest.blend) to json make sure the Blender export io_three is placed under the directory Blender\2.xx\scripts\addons. Exporting to json can be fiddly where you must first select the mesh you wish to export like selecting body below:

![alt tag](http://secondtemple.org/screenshots/jsonselectmesh.jpg) 

And then when you export to json you must specify all the correct flags once to export so that it is not missing animation, bone, texture information. These are the ones that work:

![alt tag](http://secondtemple.org/screenshots/exportjsonsmall.jpg) 

**To Do**

Currently a simple PHP based server is being created to allow for a multi user open world. 
	

