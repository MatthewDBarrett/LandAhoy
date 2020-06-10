varying vec3 FragPos;
varying vec3 Normal;
varying vec3 LightPos;
varying vec3 vWorldPosition;

uniform vec3 lightPos;

// chunk(shadowmap_pars_vertex);

void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    Normal = normalMatrix * normal;
    FragPos = vec3(modelViewMatrix * vec4(position, 1.0));
    LightPos = vec3(viewMatrix * vec4(lightPos, 1.0));
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    // store the world position as varying for lighting
    vWorldPosition = worldPosition.xyz;

    // chunk(shadowmap_vertex);
}
