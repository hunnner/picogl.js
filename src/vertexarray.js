// Copyright (c) 2017 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

"use strict";

/**
    Organizes vertex buffer and attribute state.

    @class
    @hideconstructor
    @prop {WebGLRenderingContext} gl The WebGL context.
    @prop {WebGLVertexArrayObject} vertexArray Vertex array object.
    @prop {number} numElements Number of elements in the vertex array.
    @prop {boolean} indexed Whether this vertex array is set up for indexed drawing.
    @prop {GLenum} indexType Data type of the indices.
    @prop {boolean} instanced Whether this vertex array is set up for instanced drawing.
    @prop {number} numInstances Number of instances to draw with this vertex array.
*/
function VertexArray(gl) {
    this.gl = gl;
    this.vertexArray = gl.createVertexArray();
    this.numElements = 0;
    this.indexType = null;
    this.instancedBuffers = 0;
    this.indexed = false;
    this.numInstances = 0;
}

/**
    Bind an per-vertex attribute buffer to this vertex array.

    @method
    @param {number} attributeIndex The attribute location to bind to.
    @param {VertexBuffer} vertexBuffer The VertexBuffer to bind.
*/
VertexArray.prototype.vertexAttributeBuffer = function(attributeIndex, vertexBuffer) {
    this.attributeBuffer(attributeIndex, vertexBuffer, false);

    return this;
};

/**
    Bind an per-instance attribute buffer to this vertex array.

    @method
    @param {number} attributeIndex The attribute location to bind to.
    @param {VertexBuffer} vertexBuffer The VertexBuffer to bind.
*/
VertexArray.prototype.instanceAttributeBuffer = function(attributeIndex, vertexBuffer) {
    this.attributeBuffer(attributeIndex, vertexBuffer, true);

    return this;
};

/**
    Bind an index buffer to this vertex array.

    @method
    @param {VertexBuffer} vertexBuffer The VertexBuffer to bind.
*/
VertexArray.prototype.indexBuffer = function(vertexBuffer) {
    this.gl.bindVertexArray(this.vertexArray);
    this.gl.bindBuffer(vertexBuffer.binding, vertexBuffer.buffer);

    this.numElements = vertexBuffer.numItems * 3;
    this.indexType = vertexBuffer.type;
    this.indexed = true;

    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(vertexBuffer.binding, null);

    return this;
};

/**
    Delete this vertex array.

    @method
*/
VertexArray.prototype.delete = function() {
    if (this.vertexArray) {
        this.gl.deleteVertexArray(this.vertexArray);
        this.vertexArray = null;
    }
    this.gl.bindVertexArray(null);

    return this;
};

// Bind this vertex array.
VertexArray.prototype.bind = function() {
    this.gl.bindVertexArray(this.vertexArray);

    return this;
};

// Attach an attribute buffer
VertexArray.prototype.attributeBuffer = function(attributeIndex, vertexBuffer, instanced) {
    this.gl.bindVertexArray(this.vertexArray);
    this.gl.bindBuffer(vertexBuffer.binding, vertexBuffer.buffer);

    var numColumns = vertexBuffer.numColumns;

    for (var i = 0; i < numColumns; ++i) {
        if (vertexBuffer.type === this.gl.FLOAT) {
            this.gl.vertexAttribPointer(
                attributeIndex + i,
                vertexBuffer.itemSize,
                vertexBuffer.type,
                false,
                numColumns * vertexBuffer.itemSize * PicoGL.TYPE_SIZE[vertexBuffer.type],
                i * vertexBuffer.itemSize * PicoGL.TYPE_SIZE[vertexBuffer.type]);
        } else {
            this.gl.vertexAttribIPointer(
                attributeIndex + i,
                vertexBuffer.itemSize,
                vertexBuffer.type,
                numColumns * vertexBuffer.itemSize * PicoGL.TYPE_SIZE[vertexBuffer.type],
                i * vertexBuffer.itemSize * PicoGL.TYPE_SIZE[vertexBuffer.type]);
        }

        if (instanced) {
            this.gl.vertexAttribDivisor(attributeIndex + i, 1);
        }

        this.gl.enableVertexAttribArray(attributeIndex + i);
    }

    this.instanced = this.instanced || instanced;

    if (instanced) {
        this.numInstances = vertexBuffer.numItems;
    } else {
        this.numElements = this.numElements || vertexBuffer.numItems;
    }

    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(vertexBuffer.binding, null);

    return this;
};

module.exports = VertexArray;
