let appInstance = null

export function setupSocket (app) {
  appInstance = app
}

export function $emit (collection, eventName, data) {
  appInstance.io.of(`/${collection}`).emit(eventName, data)
}
