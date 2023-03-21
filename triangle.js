// Name: Becca Nika
// NetID: rnika3

var gl;
var points;
var n = Math.floor(Math.random()*12) + 4; // initial value
var r = 1; // radius
var thetaMax = radians(360) / (2*n);
var program;
var num_triangles = 10; // inital value

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }      
    
    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Define kaleidoscope triangles
    var vertices = [];
    var colors = [];
    points = 0;

    // Add triangle points and colors to lists for rendering
    function append_triangle(triangle) {
        vertices.push(triangle[0][0]);
        vertices.push(triangle[0][1]);
        vertices.push(triangle[0][2]);
        colors.push(triangle[1][0]);
        colors.push(triangle[1][1]);
        colors.push(triangle[1][2]);
        points += 3;
    }
    
    // Make background black
    var t_black = [
        [vec2(0,0), vec2(0,1), vec2(thetaMax,1)],
        [vec4(0,0,0,1),vec4(0,0,0,1),vec4(0,0,0,1),vec4(0,0,0,1)]
    ];
    var t_black_m = mirror_triangle_p(rotate_triangle_polar(t_black, thetaMax), thetaMax);
    for (var i=0; i < n; i++) {
        t_rotated = rotate_triangle_polar(t_black, 2*i*thetaMax);
        t_r = triangle_p_to_triangle_r(t_rotated);
        append_triangle(t_r);
        
        t_rotated = rotate_triangle_polar(t_black_m, 2*i*thetaMax);
        t_r = triangle_p_to_triangle_r(t_rotated);
        append_triangle(t_r);
    }
    
    // Add multiple triangles, rotate and mirror them about origin
    var ts = []; // triangles
    var ts_m = []; // mirrored triangles

    for (var i=0; i<num_triangles; i++) {
        ts.push(random_triangle_p());
        ts_m.push(mirror_triangle_p(rotate_triangle_polar(ts[i], thetaMax), thetaMax));
    }
    for (var i=0; i<n; i++) {
        for (var j=0; j<num_triangles; j++) {
            t_rotated = rotate_triangle_polar(ts[j], 2*i*thetaMax);
            t_r = triangle_p_to_triangle_r(t_rotated);
            append_triangle(t_r);

            t_rotated = rotate_triangle_polar(ts_m[j], 2*(i+1)*thetaMax);
            t_r = triangle_p_to_triangle_r(t_rotated);
            append_triangle(t_r);
        }
    }
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition1 = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(vPosition1,2,gl.FLOAT,false,0,0)
    gl.enableVertexAttribArray( vPosition1 );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var colorBufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBufferID);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(colorLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    var ModelXform = rotateZ(0);
    var modelXformLoc = gl.getUniformLocation(program, "uModelXform");
    gl.uniformMatrix4fv(modelXformLoc, false, flatten(ModelXform) );
    gl.drawArrays( gl.TRIANGLES, 0, points );
}

// uses user input to change number of triangles
function change_num_t(num) {
    num_triangles = num;
}

// uses user input to change number of sections
function change_n(num) {
    n = num;
    thetaMax = radians(360) / (2*n);
}

// finds a random point in polar coordinates
function randomPoint_p() {
    var theta_ = thetaMax * Math.random();
    var r_ = Math.random();
    return vec2(theta_,r_);
}

// converts polar coordinates to rectangular coordinates
function p_to_r(p) {
    return vec2(p[1]*Math.cos(p[0]), p[1]*Math.sin(p[0]));
}

// generates a random color
function random_color() {
    return vec4(Math.random(),Math.random(),Math.random(),1.0);
}

// generates a triangle at three random polar coordinates with a random color
function random_triangle_p() {
    var points = [randomPoint_p(), randomPoint_p(), randomPoint_p()];
    var colors = [random_color(), random_color(), random_color(),];
    return [points, colors];
}

// rotates a given point in polar coordinates
function rotate_point_p(point, angle) {
    return vec2(point[0]+angle, point[1]);
}

// uses rotate_point_p() to translate a triangle about the origin
function rotate_triangle_polar(triangle, angle) {
    return [
        [
            rotate_point_p(triangle[0][0],angle),
            rotate_point_p(triangle[0][1],angle),
            rotate_point_p(triangle[0][2],angle),
        ],
        triangle[1]
    ];
}

// uses p_to_r() to translate a triangle into rectangular coordinates
function triangle_p_to_triangle_r(triangle_p) {
    return [
        [
            p_to_r(triangle_p[0][0]),
            p_to_r(triangle_p[0][1]),
            p_to_r(triangle_p[0][2]),
        ],
        triangle_p[1]
    ];
}

// mirrors a point in polar coordinates
function mirror_point_p(point, angle) {
    return vec2(-point[0]+angle, point[1]);
}

// uses mirror_point_p() to mirror a triangle in one section
function mirror_triangle_p(triangle_p,angle) {
    return [
        [
            mirror_point_p(triangle_p[0][0],angle),
            mirror_point_p(triangle_p[0][1],angle),
            mirror_point_p(triangle_p[0][2],angle),
        ],
        triangle_p[1]
    ];
}
