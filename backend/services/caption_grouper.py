import re
from typing import List, Dict, Any

class CaptionGrouper:
    @staticmethod
    def group_words_into_bursts(
        words: List[Dict[str, Any]], 
        max_words_per_group: int = 3,
        max_pause_seconds: float = 0.6
    ) -> List[Dict[str, Any]]:
        """
        Groups raw word timestamps into short, high-engagement bursts suitable for 
        9:16 Reels and 16:9 videos.
        Splits when:
        1. max_words_per_group is reached.
        2. A natural pause (> max_pause_seconds) occurs between words.
        3. Strong punctuation ends a sentence (., !, ?).
        """
        if not words:
            return []

        groups: List[Dict[str, Any]] = []
        current_words: List[Dict[str, Any]] = []

        for i, word_item in enumerate(words):
            current_words.append(word_item)
            
            # Check pause to next word
            is_last = (i == len(words) - 1)
            pause_detected = False
            if not is_last:
                pause_detected = (words[i + 1]["start"] - word_item["end"]) > max_pause_seconds

            ends_with_sentence_punct = bool(re.search(r'[.!?]$', word_item["word"].strip()))
            
            should_flush = (
                len(current_words) >= max_words_per_group
                or pause_detected
                or ends_with_sentence_punct
                or is_last
            )

            if should_flush and current_words:
                start_time = current_words[0]["start"]
                end_time = current_words[-1]["end"]
                text_content = " ".join(w["word"].strip() for w in current_words)

                groups.append({
                    "id": f"burst_{len(groups) + 1}",
                    "start": round(start_time, 3),
                    "end": round(end_time, 3),
                    "text": text_content,
                    "words": [
                        {
                            "id": f"w_{len(groups) + 1}_{idx + 1}",
                            "word": w["word"].strip(),
                            "start": round(w["start"], 3),
                            "end": round(w["end"], 3)
                        }
                        for idx, w in enumerate(current_words)
                    ]
                })
                current_words = []

        return groups
