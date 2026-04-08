import os
from structure import instance
from algorithms import grasp


def executeInstance(instances, num_executions, output_file):
    # Carpeta donde está este main.py
    base_dir = os.path.dirname(__file__)

    with open(output_file, "w") as file:
        for path in instances:
            # Encabezado de instancia
            file.write("========================================================\n")
            file.write(f"INSTANCIA: {path}\n")
            file.write("Ejecución | Mejor solución GRASP\n")
            file.write("--------------------------------------------------------\n")

            for i in range(1, num_executions + 1):
                # Ruta completa al fichero de instancia
                full_path = os.path.join(base_dir, path)

                inst = instance.readInstance(full_path)
                sol = grasp.execute(inst, 1, 0.75)

                # Escribimos solo el valor de la función objetivo
                file.write(f"{round(sol['of'], 2)} ")

            # Línea en blanco + cierre de bloque
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
    output_file = "resultadosGRASP.txt"
    executeInstance(instances, num_executions, output_file)

