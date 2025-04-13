//#[tauri::command]
//fn toggle_fullscreen(window: tauri::Window) -> Result<(), String> {
//    let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
//    window
//        .set_fullscreen(!is_fullscreen)
//        .map_err(|e| e.to_string())?;
//    Ok(())
//}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        //.invoke_handler(tauri::generate_handler![toggle_fullscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
