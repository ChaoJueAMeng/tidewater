import './headless.mjs';
import assert from 'node:assert/strict';
import { GPU } from '../src/engine/gpu/GPU.js';
import { composeShader, setFrameUniforms } from '../src/engine/gpu/Shader.js';

await GPU.init( { headless: true } );
setFrameUniforms( { structName: 'Frame', wgsl: 'struct Frame { value: f32, }' } );
const shader = composeShader( {
	stage: 'compute',
	entry: 'custom',
	bindings: { live: { uniformBuffer: {}, wgslType: 'u32' }, unused: { uniformBuffer: {}, wgslType: 'u32' } },
	code: `// fn phantom() {
@compute @workgroup_size( 1 ) fn custom() { let x = live; }
fn discarded() { let x = unused; }`,
} );
assert.deepEqual( shader.bindings.names, [ 'live' ] );
const info = await GPU.device.createShaderModule( { code: shader.code } ).getCompilationInfo();
assert.deepEqual( info.messages.filter( ( m ) => m.type === 'error' ), [] );
console.log( 'shader composition passed' );
