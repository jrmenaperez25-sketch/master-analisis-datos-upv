def select_elite_set(all_solutions, max_size, difference_threshold):
    # 1. Ordenar las soluciones por valor objetivo de mayor a menor
        sorted_solutions = sorted(all_solutions, key=lambda sol: sol['of'], reverse=True)

        # 2. Creamos la lista vacía del elite set
        elite_set = []

        p = len(sorted_solutions[1]['sol'])  # número de nodos en cada solución factible

        # 3. Iterar sobre las soluciones ordenadas y filtrar
        for candidate in sorted_solutions:
            is_distant = True
            for elite_sol in elite_set:
                # Calculamos cuántos nodos difieren
                intersec_size = len(candidate['sol'] & elite_sol['sol'])
                if p - intersec_size < difference_threshold * p:
                    # No cumple la diversidad mínima, rompemos
                    is_distant = False
                    break
            # Si resultó ser distinta de todas, la agregamos
            if is_distant:
                elite_set.append(candidate)

            # Revisamos si llegamos al tamaño máximo
            if len(elite_set) >= max_size:
                break

        return elite_set
