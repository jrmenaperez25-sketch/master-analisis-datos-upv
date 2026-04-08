import os
from structure import instance
from algorithms import GraspPL
from pathfunctions import cosas
from pathfunctions import elite


def executeinstance(instances, num_executions, output_file):
    # Carpeta donde está este main.py
    base_dir = os.path.dirname(__file__)

    with open(output_file, "w") as file:
        for path in instances:
            # Encabezado de instancia
            file.write("========================================================\n")
            file.write(f"INSTANCIA: {path}\n")
            file.write("Ejecución | Mejor solución GRASP+PR\n")
            file.write("--------------------------------------------------------\n")

            for i in range(1, num_executions + 1):
                # Ruta completa al fichero de instancia
                full_path = os.path.join(base_dir, path)

                inst = instance.readInstance(full_path)

                all_solutions = GraspPL.execute(inst, 10, 0.75)
                eliteset = elite.select_elite_set(all_solutions, 100, 0.5)
                best_of_best = cosas.elite_path_relinking(eliteset, 40)

                file.write(f"{round(best_of_best['of'], 2)} ")

            file.write("\n========================================================\n\n")


if __name__ == '__main__':
    instances = [
        "instances/MDG-a_1_100_m10.txt",
        "instances/MDG-a_4_100_m10.txt",
        "instances/MDG-a_10_100_m10.txt",
        "instances/MDG-a_12_100_m10.txt",
        "instances/MDG-a_14_100_m10.txt",
        "instances/MDG-a_20_100_m10.txt",
        "instances/MDG-a_2_n500_m50.txt",
        "instances/MDG-a_5_n500_m50.txt",
        "instances/MDG-a_6_n500_m50.txt",
        "instances/MDG-a_9_n500_m50.txt",
        "instances/MDG-a_13_n500_m50.txt",
        "instances/MDG-a_16_n500_m50.txt",
        "instances/MDG-a_17_n500_m50.txt",
        "instances/MDG-a_19_n500_m50.txt",
        "instances/MDG-a_20_n500_m50.txt"
    ]
    num_executions = 3
    output_file = "resultadosGRASPPR.txt"
    executeinstance(instances, num_executions, output_file)
