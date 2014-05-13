/**
 * @author jbouny / http://github.com/jbouny
 *
 * Effect to render the scene into a cubemap
 */

THREE.CubemapEffect = function ( renderer, options ) {
	var faceOptions = (options) ? options: {
		size: Math.min( window.innerWidth / 4, window.innerHeight / 3 )
	};
	
	// Generate camera rotations in order to render cubemap
	var facesRotations = [
		new THREE.Euler( 0, -1.5 * Math.PI, 0 ),
		new THREE.Euler( 0, 0, 0 ),
		new THREE.Euler( 0, -0.5 * Math.PI, 0 ),
		new THREE.Euler( 0, -1.0 * Math.PI, 0 ),
		new THREE.Euler( 0.5 * Math.PI, 0, 0 ),
		new THREE.Euler(-0.5 * Math.PI, 0, 0 )
	];
	for( var i = 0; i < 6; ++i ) {
		facesRotations[i] = (new THREE.Matrix4()).makeRotationFromEuler( facesRotations[i] ) ;
	}

	// Perspective camera
	var pCamera = new THREE.PerspectiveCamera();
	pCamera.matrixAutoUpdate = false;
	pCamera.target = new THREE.Vector3();
	pCamera.projectionMatrix.copy((new THREE.Matrix4()).makePerspective( 90.0, 1, 0.3, 100000 ));

	renderer.autoClear = false;
	var emptyColor = new THREE.Color("black");
    var viewports = [];
	
	this.setConfig = function(config) {
		faceOptions = config;

		// Compute viewports
		for( i=0; i < 4; ++i ) {
			viewports[i] = [faceOptions.size * i, faceOptions.size, faceOptions.size, faceOptions.size];
		}
		viewports[4] = [faceOptions.size, faceOptions.size * 2, faceOptions.size, faceOptions.size];
		viewports[5] = [faceOptions.size, 0, faceOptions.size, faceOptions.size];

	}

	this.setConfig( faceOptions );

	this.setSize = function ( width, height ) {
		this.setConfig( { size: Math.min( width / 4, height / 3 ) } );

		renderer.setSize( width, height );
	};

	this.render = function ( scene, camera ) {
		// Clear
		var clearColor = renderer.getClearColor().clone();
		renderer.setClearColor(emptyColor);
		renderer.clear();
		renderer.setClearColor(clearColor);

		camera.updateMatrixWorld(true);
		
		// Render each face
		for( var i = 0; i < 6; ++i ) {
			// Apply rotation
			pCamera.matrix.copy( camera.matrixWorld ).multiply( facesRotations[i] );
			pCamera.matrixWorldNeedsUpdate = true;

			// Render the face into its viewport
			renderer.setViewport( viewports[i][0], viewports[i][1], viewports[i][2], viewports[i][3] );
			renderer.render( scene, pCamera );
		}
		
		// Restore viewport
		renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
	};
};