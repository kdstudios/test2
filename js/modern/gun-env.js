/* procedural studio/outdoor environment for gun metals (PMREM from a small scene) */
window.RGUN_makeEnv=function(renderer){
  const THREE=window.THREE,s=new THREE.Scene();
  const sky=new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 p;void main(){float h=p.y;vec3 top=vec3(.55,.68,.88),hor=vec3(.82,.84,.82),gr=vec3(.18,.16,.14);vec3 c=h>0.?mix(hor,top,pow(h,.6)):mix(hor*.6,gr,pow(-h,.5));gl_FragColor=vec4(c,1.);}'}));
  s.add(sky);
  const panel=(w,h,x,y,z,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(i,i,i*.94),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);s.add(m)};
  panel(30,14,-24,22,12,5);panel(18,8,26,12,-10,3);panel(40,3,0,34,0,4);panel(10,30,0,6,-40,1.6);
  const pm=new THREE.PMREMGenerator(renderer);const rt=pm.fromScene(s,0.02);pm.dispose();
  sky.geometry.dispose();return rt.texture;
};
