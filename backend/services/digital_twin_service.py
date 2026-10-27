from services.ml_service import MLService

class DigitalTwinService:
    def __init__(self):
        self.ml_service = MLService()

    def simulate_what_if(self, centre, what_if_params: dict):
        """
        Simulates procurement centre operational dynamics under what-if conditions:
          - add_counter: int (e.g. +1, +2)
          - remove_counter: int (e.g. 1)
          - heavy_rain: bool (slows down inspection & weighing, drops rate by 35%)
          - extra_farmers: int (e.g. 50 extra farmers arriving)

        Returns baseline vs simulated metrics and AI recommendation.
        """
        # Baseline parameters
        base_counters = centre.active_counters
        base_queue = centre.current_queue
        base_rate = centre.processing_rate
        base_arrivals = centre.processed_today + base_queue
        base_staff = centre.staff_available

        # 1. Baseline Evaluation
        base_overload = self.ml_service.predict_overload(
            predicted_arrivals=base_arrivals,
            centre_capacity=centre.total_capacity,
            current_queue=base_queue,
            staff_available=base_staff,
            number_of_counters=base_counters,
            processing_rate=base_rate,
            remaining_capacity=centre.remaining_capacity,
            daily_processing_capacity=centre.daily_processing_capacity
        )
        base_eta = self.ml_service.predict_eta(
            queue=base_queue,
            counters=base_counters,
            processing_rate=base_rate
        )
        base_decision = self.ml_service.evaluate_decision_intelligence(
            queue=base_queue,
            eta_minutes=base_eta['estimated_wait_minutes'],
            overload_risk=base_overload['risk_level']
        )

        # 2. Apply What-If Modifications
        sim_counters = base_counters
        if what_if_params.get('add_counter'):
            sim_counters += int(what_if_params['add_counter'])
        if what_if_params.get('remove_counter'):
            sim_counters = max(1, sim_counters - int(what_if_params['remove_counter']))

        sim_rate = base_rate
        weather_condition = "Normal Weather"
        if what_if_params.get('heavy_rain'):
            sim_rate = round(base_rate * 0.65, 1)  # 35% reduction due to weather
            weather_condition = "Heavy Rain Alert (Processing rate reduced by 35%)"

        sim_queue = base_queue
        extra_count = int(what_if_params.get('extra_farmers', 0))
        if extra_count > 0:
            sim_queue += extra_count

        sim_arrivals = base_arrivals + extra_count
        sim_staff = max(2, sim_counters * 2)

        # 3. Simulated Evaluation
        sim_overload = self.ml_service.predict_overload(
            predicted_arrivals=sim_arrivals,
            centre_capacity=centre.total_capacity,
            current_queue=sim_queue,
            staff_available=sim_staff,
            number_of_counters=sim_counters,
            processing_rate=sim_rate,
            remaining_capacity=max(0.0, centre.remaining_capacity - (extra_count * 2.0)),
            daily_processing_capacity=centre.daily_processing_capacity
        )
        sim_eta = self.ml_service.predict_eta(
            queue=sim_queue,
            counters=sim_counters,
            processing_rate=sim_rate
        )
        sim_decision = self.ml_service.evaluate_decision_intelligence(
            queue=sim_queue,
            eta_minutes=sim_eta['estimated_wait_minutes'],
            overload_risk=sim_overload['risk_level']
        )

        # 4. Impact Analysis
        queue_delta = sim_queue - base_queue
        wait_delta = round(sim_eta['estimated_wait_minutes'] - base_eta['estimated_wait_minutes'], 1)
        prob_delta = round((sim_overload['overload_probability'] - base_overload['overload_probability']) * 100.0, 1)

        # Farmers to shift recommendation
        suggested_shift_count = 0
        if sim_overload['risk_level'] == 'HIGH' or sim_eta['estimated_wait_minutes'] > 180:
            suggested_shift_count = min(sim_queue, max(10, int(sim_queue * 0.35)))

        return {
            'centre_id': centre.id,
            'centre_name': centre.name,
            'weather_condition': weather_condition,
            'scenarios_applied': {
                'add_counter': what_if_params.get('add_counter', 0),
                'remove_counter': what_if_params.get('remove_counter', 0),
                'heavy_rain': bool(what_if_params.get('heavy_rain', False)),
                'extra_farmers': extra_count
            },
            'baseline': {
                'active_counters': base_counters,
                'queue': base_queue,
                'processing_rate': base_rate,
                'estimated_wait_minutes': base_eta['estimated_wait_minutes'],
                'overload_probability': base_overload['overload_probability'],
                'risk_level': base_overload['risk_level'],
                'decision_action': base_decision['action']
            },
            'simulated': {
                'active_counters': sim_counters,
                'queue': sim_queue,
                'processing_rate': sim_rate,
                'estimated_wait_minutes': sim_eta['estimated_wait_minutes'],
                'overload_probability': sim_overload['overload_probability'],
                'risk_level': sim_overload['risk_level'],
                'decision_action': sim_decision['action'],
                'decision_reason': sim_decision['reason']
            },
            'impact': {
                'queue_change': f"+{queue_delta}" if queue_delta >= 0 else str(queue_delta),
                'wait_time_change_minutes': f"+{wait_delta}" if wait_delta >= 0 else str(wait_delta),
                'overload_risk_change_percent': f"+{prob_delta}%" if prob_delta >= 0 else f"{prob_delta}%",
                'suggested_farmers_to_shift': suggested_shift_count,
                'action_recommendation': sim_decision['action']
            }
        }
