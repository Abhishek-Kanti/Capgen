import re
from typing import List, Dict, Any

def hex_to_ass_color(hex_str: str, alpha: int = 0) -> str:
    """
    Converts #RRGGBB or #RGB hex string to ASS &HAABBGGRR format.
    ASS uses BGR order.
    """
    hex_clean = hex_str.lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join(c * 2 for c in hex_clean)
    if len(hex_clean) != 6:
        hex_clean = 'FFFFFF'
        
    r = hex_clean[0:2]
    g = hex_clean[2:4]
    b = hex_clean[4:6]
    
    alpha_hex = f"{alpha:02X}"
    return f"&H{alpha_hex}{b}{g}{r}&"

def format_ass_time(seconds: float) -> str:
    """
    Converts seconds (e.g. 73.45) to ASS timestamp format: H:MM:SS.cs
    """
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centis = int(round((seconds - int(seconds)) * 100))
    if centis >= 100:
        centis = 99
    return f"{hrs}:{mins:02d}:{secs:02d}.{centis:02d}"

class ASSGenerator:
    @staticmethod
    def generate_ass(
        segments: List[Dict[str, Any]],
        video_width: int,
        video_height: int,
        style_config: Dict[str, Any]
    ) -> str:
        """
        Generates an Advanced SubStation Alpha (.ass) subtitle file 
        with word-level karaoke styling and precise dragging coordinates.
        """
        font_name = style_config.get("fontFamily", "Montserrat")
        font_size = style_config.get("fontSize", 20)
        font_weight = style_config.get("fontWeight", 900)
        letter_spacing = style_config.get("letterSpacing", -0.5)
        text_align = style_config.get("textAlign", "center")
        text_color_hex = style_config.get("textColor", "#18181B")
        highlight_color_hex = style_config.get("highlightColor", "#6366F1")
        bg_color_hex = style_config.get("bgColor", "#FFFFFF")
        has_bg = style_config.get("hasBg", True)
        box_padding_x = style_config.get("boxPaddingX", 12)
        box_padding_y = style_config.get("boxPaddingY", 4)
        stroke_color_hex = style_config.get("strokeColor", "#000000")
        stroke_width = style_config.get("strokeWidth", 0)
        is_uppercase = style_config.get("uppercase", True)
        y_percent = style_config.get("yPercent", 72.0)  # Percentage from top (0-100)
        
        # Coordinates for positioning
        pos_y = int(video_height * (y_percent / 100.0))
        if text_align == "left":
            pos_x = int(video_width * 0.1)
            alignment = 4  # Middle-Left
        elif text_align == "right":
            pos_x = int(video_width * 0.9)
            alignment = 6  # Middle-Right
        else:
            pos_x = int(video_width / 2)
            alignment = 5  # Middle-Center

        primary_color = hex_to_ass_color(text_color_hex)
        highlight_color = hex_to_ass_color(highlight_color_hex)
        back_color = hex_to_ass_color(bg_color_hex, alpha=0)
        outline_color = hex_to_ass_color(stroke_color_hex)

        # Scale factor based on video reference width
        ref_width = 360.0 if video_height >= video_width else 850.0
        scale_factor = video_width / ref_width if ref_width > 0 else 1.0
        scaled_font_size = max(int(round(font_size * scale_factor)), 16)
        scaled_stroke = int(round(stroke_width * scale_factor)) if stroke_width > 0 else 0
        scaled_spacing = int(round(letter_spacing * scale_factor))
        scaled_outline_padding = int(round(box_padding_y * scale_factor)) if has_bg else scaled_stroke

        # BorderStyle: 3 for opaque box, 1 for outline with shadow
        border_style = 3 if has_bg else 1
        bold_flag = -1 if font_weight >= 700 else 0

        header = f"""[Script Info]
Title: Capgen Generated Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: {video_width}
PlayResY: {video_height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{scaled_font_size},{primary_color},{highlight_color},{outline_color},{back_color},{bold_flag},0,0,0,100,100,{scaled_spacing},0,{border_style},{scaled_outline_padding},{2 if stroke_width > 0 else 0},{alignment},20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        events = []
        for segment in segments:
            words = segment.get("words", [])
            if not words:
                continue

            # Create micro-events for each word in the burst to colorize the active word
            for active_idx, active_word in enumerate(words):
                w_start = format_ass_time(active_word["start"])
                w_end = format_ass_time(active_word["end"])
                
                # Assemble text with active word highlighted and guaranteed hard spaces (\h)
                line_parts = []
                for idx, w in enumerate(words):
                    raw_word = w["word"].upper() if is_uppercase else w["word"]
                    if idx == active_idx:
                        # Highlight active spoken word
                        line_parts.append(f"{{\\c{highlight_color}}}{raw_word}{{\\c{primary_color}}}")
                    else:
                        line_parts.append(raw_word)

                dialogue_text = "\\h".join(line_parts)
                # Position middle at exact user coordinates
                dialogue_text = f"{{\\an{alignment}\\pos({pos_x},{pos_y})}}{dialogue_text}"
                
                event_line = f"Dialogue: 0,{w_start},{w_end},Default,,0,0,0,,{dialogue_text}"
                events.append(event_line)

        return header + "\n".join(events) + "\n"
