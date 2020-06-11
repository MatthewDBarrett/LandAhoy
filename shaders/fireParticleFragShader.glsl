uniform float opacity;
uniform vec3 color1;
uniform vec3 color2;
uniform float colorlerp;

void main(){
    vec3 col1 = color1;
    vec3 col2 = color2;

    col1.x = col1.x/=256.0;
    col1.y = col1.y/=256.0;
    col1.z = col1.z/=256.0;

    col2.x = col2.x/=256.0;
    col2.y = col2.y/=256.0;
    col2.z = col2.z/=256.0;

    vec3 col = mix(col1, col2, colorlerp);
	gl_FragColor = vec4(col,opacity);
}