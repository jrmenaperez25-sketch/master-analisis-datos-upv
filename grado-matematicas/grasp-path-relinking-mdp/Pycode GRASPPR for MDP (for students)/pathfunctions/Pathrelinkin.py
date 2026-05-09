from selectors import SelectSelector

from structure import solution
from localsearch import lsbestimp

def path_relinking(initial_sol, final_sol):
    to_add = final_sol['sol'] - initial_sol['sol'] #los nodos a añadir a la solución de la que partimos
    to_remove = initial_sol['sol'] - final_sol['sol'] #los nodos a eliminar de la solución de la que partimos
    current_sol = initial_sol.copy() #copia de la initial_sol para no modificarla
    intermediate_solutions = []

    while len(to_add) > 0 and len(to_remove) > 0:
        best_distance = -1
        best_node_to_add = None
        best_node_to_remove = None
        for add_node in to_add:
            for remove_node in to_remove:
                d=solution.distanceToSol(current_sol, add_node, without = remove_node)
                if best_distance == -1 or best_distance <= d:
                    best_distance = d
                    best_node_to_remove = remove_node
                    best_node_to_add = add_node
        solution.removeFromSolution(current_sol, best_node_to_remove)
        solution.addToSolution(current_sol, best_node_to_add)
        intermediate_solutions.append(current_sol.copy()) # Guardamos una copia, no una referencia
        to_add.remove(best_node_to_add) # actualización en O(1) de nodos restantes a añadir
        to_remove.remove(best_node_to_remove) # actualización en O(1) de nodos a eliminar
    best_intermediate = max(intermediate_solutions, key=lambda sol: sol['of']) #mejor solución intermedia, a la que aplicaremos LocalSearch

    lsbestimp.improve(best_intermediate)

    best_sol_path = (
        best_intermediate if best_intermediate['of'] > initial_sol['of'] else initial_sol
    ) #ver si la mejor solución encontrada por el PR es la final o la mejor de las intermedias tras aplicarle LocalSearch

    return best_sol_path