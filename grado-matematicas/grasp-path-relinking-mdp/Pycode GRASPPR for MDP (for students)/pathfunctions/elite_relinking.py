from pathfunctions import Pathrelinkin
import time

def elite_path_relinking(elite_set, time_limit): #funcion que aplica PR a las soluciones del eliteset
    start_time = time.time()
    path_solutions = [] #creamos lista vacia, donde irán las soluciones de todas las iteraciones del Path Relinking
    
    num_elite = len(elite_set)
    for i in range(num_elite):
        if time.time() - start_time >= time_limit:
            break
        for j in range(i + 1, num_elite):
            if time.time() - start_time >= time_limit:
                break
            initial_sol = elite_set[i]
            final_sol = elite_set[j]
            path_solution = Pathrelinkin.path_relinking(initial_sol, final_sol) # Solución del PR
            path_solutions.append(path_solution)
            
    if path_solutions:  # Si hay soluciones generadas
        best_overall = max(path_solutions, key=lambda sol: sol['of'])  # Mejor solución obtenida
        return best_overall
    else:  # Si no se generaron soluciones
        return None