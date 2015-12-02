/* global THREE, Kontrol, GUI */

import {smoothstep} from 'interpolation'
import Config from '../config'

const TRANSITION_DURATION = 1500

export default class CompositePass extends THREE.ShaderPass {
	constructor() {
		super({
			uniforms: {
				resolution: {type: 'v2', value: new THREE.Vector2(Config.RENDER_WIDTH, Config.RENDER_HEIGHT)},
				exclusionColor: {type: 'c', value: new THREE.Color(0x000000)},
				hsvAjust: {type: 'v3', value: new THREE.Vector3(0, 1, 1)},
				tDiffuse: {type: 't', value: null}
			},
			vertexShader: require('../shaders/basic-transform.vert'),
			fragmentShader: require('../shaders/composite.frag'),
		})
		this.enabled = true

		this.currentExclusionColor = new THREE.Color(0, 0, 0)
		this.targetExclusionColor = new THREE.Color(0, 0, 0)
		this.transitionTime = null

		Kontrol.on('changeExclusionColor', (value) => {
			if (this.transitionTime == null) {
				this.currentExclusionColor.set(this.targetExclusionColor)
			} else {
				this.currentExclusionColor.set(this.uniforms.exclusionColor.value)
			}
			this.targetExclusionColor.set(value)
			this.transitionTime = TRANSITION_DURATION
		})

		// ajust
		GUI.add(this.uniforms.hsvAjust.value, 'x', -1, 1).name('hue')
		GUI.add(this.uniforms.hsvAjust.value, 'y', 0, 2).name('saturation')
		GUI.add(this.uniforms.hsvAjust.value, 'z', 0, 2).name('brightness')

	}

	update(elapsed) {

		if (this.transitionTime != null) {

			this.transitionTime -= elapsed

			if (this.transitionTime > 0) {
				let t = 1 - (this.transitionTime / TRANSITION_DURATION)
				t = smoothstep(0, 1, t)
				t = smoothstep(0, 1, t)
				this.uniforms.exclusionColor.value.set(this.currentExclusionColor)
				this.uniforms.exclusionColor.value.lerp(this.targetExclusionColor, t)
			} else {
				this.uniforms.exclusionColor.value.set(this.targetExclusionColor)
				this.transitionTime = null
			}
		}
	}
}
