package com.github.continuedev.continueintellijextension.editor

import com.intellij.openapi.components.Service
import com.intellij.openapi.editor.Editor

@Service(Service.Level.APP)
class DiffStreamService {
    private val handlers = mutableMapOf<Editor, DiffStreamHandler>()

    fun register(handler: DiffStreamHandler, editor: Editor) {
        if (handlers.containsKey(editor)) {
            handlers[editor]?.reject()
        }
        handlers[editor] = handler
    }

    fun reject(editor: Editor) {
        handlers[editor]?.reject()
        handlers.remove(editor)
    }

    fun accept(editor: Editor) {
        handlers[editor]?.accept()
        handlers.remove(editor)
    }
}