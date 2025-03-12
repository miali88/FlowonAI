import functools
import logging
import time
import inspect
import json
from typing import Any, Callable, Dict, List, Optional, TypeVar, cast

# Type variables for function annotations
F = TypeVar('F', bound=Callable[..., Any])

# Configure logger
logger = logging.getLogger("flow_tracker")

class FlowTracker:
    """
    Utility class for tracking function execution flow with enhanced logging.
    Provides decorators and context managers for tracking function execution.
    """
    
    _active_flows: Dict[str, List[Dict[str, Any]]] = {}
    _current_flow_id: Optional[str] = None
    
    @classmethod
    def start_flow(cls, flow_id: str, description: str = "") -> None:
        """
        Start tracking a new flow
        
        Args:
            flow_id: Unique identifier for the flow
            description: Description of the flow
        """
        cls._current_flow_id = flow_id
        cls._active_flows[flow_id] = []
        logger.info(f"🚀 Starting flow: {flow_id} - {description}")
    
    @classmethod
    def end_flow(cls, flow_id: Optional[str] = None) -> Dict[str, Any]:
        """
        End tracking a flow and return the flow data
        
        Args:
            flow_id: Optional flow ID. If None, uses current flow ID
            
        Returns:
            Dictionary with flow data
        """
        flow_id = flow_id or cls._current_flow_id
        if not flow_id or flow_id not in cls._active_flows:
            logger.warning(f"⚠️ Attempted to end unknown flow: {flow_id}")
            return {}
        
        flow_data = {
            "flow_id": flow_id,
            "steps": cls._active_flows[flow_id]
        }
        
        logger.info(f"✅ Completed flow: {flow_id} - {len(flow_data['steps'])} steps")
        
        del cls._active_flows[flow_id]
        if cls._current_flow_id == flow_id:
            cls._current_flow_id = None
        
        return flow_data
    
    @classmethod
    def track_step(
        cls, 
        step_name: str, 
        data: Dict[str, Any] = None, 
        flow_id: Optional[str] = None
    ) -> None:
        """
        Track a step in a flow
        
        Args:
            step_name: Name of the step
            data: Optional data associated with the step
            flow_id: Optional flow ID. If None, uses current flow ID
        """
        flow_id = flow_id or cls._current_flow_id
        if not flow_id or flow_id not in cls._active_flows:
            logger.warning(f"⚠️ Attempted to track step in unknown flow: {flow_id}")
            return
        
        step_data = {
            "name": step_name,
            "timestamp": time.time(),
            "data": data or {}
        }
        
        cls._active_flows[flow_id].append(step_data)
        
        # Pretty format data for logging if present
        data_str = ""
        if data:
            try:
                # Format the first few items if data is large
                if len(data) > 3:
                    data_sample = {k: data[k] for k in list(data.keys())[:3]}
                    data_str = f" - Data: {json.dumps(data_sample)}... and {len(data)-3} more"
                else:
                    data_str = f" - Data: {json.dumps(data)}"
            except (TypeError, ValueError):
                data_str = f" - Data: [complex object]"
        
        logger.info(f"➡️ Step: {step_name}{data_str}")

    @classmethod
    def track_function(cls, flow_id: Optional[str] = None) -> Callable[[F], F]:
        """
        Decorator to track function execution as part of a flow
        
        Args:
            flow_id: Optional flow ID. If None, uses current flow ID
            
        Returns:
            Decorated function
        """
        def decorator(func: F) -> F:
            @functools.wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                arg_values = inspect.getcallargs(func, *args, **kwargs)
                
                # Remove self or cls from arg_values if it's there
                if 'self' in arg_values:
                    del arg_values['self']
                if 'cls' in arg_values:
                    del arg_values['cls']
                
                # Clean sensitive data
                clean_args = {
                    k: v if k not in ['password', 'token', 'secret', 'key'] 
                    else '[REDACTED]' for k, v in arg_values.items()
                }
                
                # Start timing
                start_time = time.time()
                current_flow = flow_id or cls._current_flow_id
                
                # Log function entry
                cls.track_step(
                    f"{func.__name__}:start", 
                    {"args": clean_args},
                    current_flow
                )
                
                try:
                    # Call the function
                    result = await func(*args, **kwargs)
                    
                    # Log function exit
                    duration = time.time() - start_time
                    cls.track_step(
                        f"{func.__name__}:end",
                        {"duration": f"{duration:.3f}s", "status": "success"},
                        current_flow
                    )
                    
                    return result
                    
                except Exception as e:
                    # Log error
                    duration = time.time() - start_time
                    cls.track_step(
                        f"{func.__name__}:error",
                        {
                            "duration": f"{duration:.3f}s", 
                            "status": "error",
                            "error": str(e)
                        },
                        current_flow
                    )
                    raise
            
            @functools.wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                arg_values = inspect.getcallargs(func, *args, **kwargs)
                
                # Remove self or cls from arg_values if it's there
                if 'self' in arg_values:
                    del arg_values['self']
                if 'cls' in arg_values:
                    del arg_values['cls']
                
                # Clean sensitive data
                clean_args = {
                    k: v if k not in ['password', 'token', 'secret', 'key'] 
                    else '[REDACTED]' for k, v in arg_values.items()
                }
                
                # Start timing
                start_time = time.time()
                current_flow = flow_id or cls._current_flow_id
                
                # Log function entry
                cls.track_step(
                    f"{func.__name__}:start", 
                    {"args": clean_args},
                    current_flow
                )
                
                try:
                    # Call the function
                    result = func(*args, **kwargs)
                    
                    # Log function exit
                    duration = time.time() - start_time
                    cls.track_step(
                        f"{func.__name__}:end",
                        {"duration": f"{duration:.3f}s", "status": "success"},
                        current_flow
                    )
                    
                    return result
                    
                except Exception as e:
                    # Log error
                    duration = time.time() - start_time
                    cls.track_step(
                        f"{func.__name__}:error",
                        {
                            "duration": f"{duration:.3f}s", 
                            "status": "error",
                            "error": str(e)
                        },
                        current_flow
                    )
                    raise
            
            # Return the appropriate wrapper based on function type
            if inspect.iscoroutinefunction(func):
                return cast(F, async_wrapper)
            return cast(F, sync_wrapper)
        
        return decorator 