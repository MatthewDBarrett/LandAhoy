varying vec3 FragPos;
varying vec3 Normal;
varying vec3 LightPos;
varying vec3 vWorldPosition;

uniform vec3 lightColor;
uniform vec3 landscapeColor;

void main(){
    // ambient
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor; 

    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(LightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    //specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(-FragPos); // the viewer is always at (0,0,0) in view-space, so viewDir is (0,0,0) - Position => -Position
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = specularStrength * spec * lightColor; 

    vec3 rgb = normalize( Normal ) * 0.5 + 0.5;

    vec3 lightDirection = normalize(LightPos - vWorldPosition);

    // simpliest hardcoded lighting ^^
    float c = 0.35 + max(0.0, dot(Normal, lightDirection)) * 0.4;

    vec3 result = (ambient + diffuse + specular) * rgb;
	gl_FragColor = vec4(result,1.0);
}
