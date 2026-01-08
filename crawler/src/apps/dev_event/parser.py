import re
from typing import List
from .models import DevEvent
from loguru import logger

def parse_readme(content: str) -> List[DevEvent]:
    events = []
    lines = content.split('\n')

    current_year = ""
    current_month = ""

    # Regex for section headers like "## 26년 01월" or "## 2026년 1월"
    header_pattern = re.compile(r'^##\s+(\d{2,4})년\s+(\d{1,2})월')

    # Regex for table rows
    # Expected format: | <img /> | [Title](Link) | Date | Location |
    # We will split by '|' and clean up

    in_table = False

    for line in lines:
        line = line.strip()

        # Check header
        if line.startswith('##'):
            header_match = header_pattern.match(line)
            if header_match:
                year_str = header_match.group(1)
                month_str = header_match.group(2)

                # Normalize year to 20XX
                if len(year_str) == 2:
                    current_year = f"20{year_str}"
                else:
                    current_year = year_str

                current_month = month_str.zfill(2)
            else:
                current_year = ""
                current_month = ""

            in_table = False # Reset table state on new section
            continue

        # Check table
        if line.startswith('|') and line.endswith('|'):
            # Skip separator lines |---|---|
            if '---' in line:
                in_table = True
                continue

            # Skip header row if it contains "행사명"
            if "행사명" in line:
                continue

            parts = [p.strip() for p in line.split('|')]
            # split('|') on "| a | b |" gives ["", "a", "b", ""]
            # We expect at least 5 parts (empty, col1, col2, col3, col4, empty)

            if len(parts) < 5:
                continue

            if not current_year or not current_month:
                continue

            # Columns:
            # 1: Image (ignored for now)
            # 2: Title + Link -> [Title](Link)
            # 3: Date
            # 4: Location/Tags

            col_title = parts[2]
            col_date = parts[3]
            col_location = parts[4]

            # Extract Title and Link
            # [Title](Link)
            link_match = re.match(r'\[(.*?)\]\((.*?)\)', col_title)
            title = col_title
            url = None

            if link_match:
                title = link_match.group(1)
                url = link_match.group(2)
            else:
                # Sometimes it might just be text or <a> tag?
                # For now assume markdown link logic
                pass

            # Extract Start/End date
            # Format: 2026.01.01 ~ 2026.01.05 or 10.01 ~ 10.15
            # We will just store the raw string for now or try basic split
            start_date = col_date
            end_date = None
            if "~" in col_date:
                date_parts = col_date.split("~")
                start_date = date_parts[0].strip()
                end_date = date_parts[1].strip()

            if not title:
                continue

            event = DevEvent(
                title=title,
                url=url,
                start_date=start_date,
                end_date=end_date,
                location=col_location,
                tags=[current_year, current_month] # Add year/month as basic tags
            )
            events.append(event)

    logger.info(f"Parsed {len(events)} events from README")
    return events
