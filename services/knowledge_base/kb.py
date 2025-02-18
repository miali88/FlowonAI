async def get_kb_items(user_id: str, page: int = 0):
    try:
        logger.info(f"Fetching items for user: {user_id}, page: {page}")
        items = []
        total_tokens = 0  # Initialize to 0
        
        # Process web data
        web_items = process_web_data(user_id)
        if web_items:
            items.extend(web_items)
            # Safely add token counts
            web_tokens = sum(item.get('token_count', 0) or 0 for item in web_items)
            total_tokens += web_tokens

        # Process text files
        text_items = process_text_files(user_id)
        if text_items:
            items.extend(text_items)
            # Safely add token counts
            text_tokens = sum(item.get('token_count', 0) or 0 for item in text_items)
            total_tokens += text_tokens

        return items, total_tokens
    except Exception as e:
        logger.error(f"Error in get_kb_items: {str(e)}")
        raise 